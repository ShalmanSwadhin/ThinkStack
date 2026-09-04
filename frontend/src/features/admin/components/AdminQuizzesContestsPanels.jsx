import Button from '../../../components/ui/Button';
import AdminDataTable from './AdminDataTable';

const initialQuizForm = {
  topicSlug: '',
  title: '',
  passingScore: '70',
  timeLimitMinutes: '10',
  xpReward: '30',
  status: 'draft',
};

const initialContestForm = {
  title: '',
  slug: '',
  description: '',
  rules: '',
  difficulty: 'medium',
  visibility: 'public',
  startTime: '',
  endTime: '',
  problemSlugs: '',
  timeLimitMinutes: '',
};

export function AdminQuizzesPanel({ quizzes, topics, isSaving, onCreate, onUpdateStatus, onEdit, onDuplicate, onDelete, onPreview }) {
  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border bg-white p-4 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onCreate({
            topicSlug: form.get('topicSlug'),
            title: form.get('title'),
            passingScore: Number(form.get('passingScore')),
            timeLimitMinutes: Number(form.get('timeLimitMinutes')),
            xpReward: Number(form.get('xpReward')),
            status: form.get('status'),
          });
          event.currentTarget.reset();
        }}
      >
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Create quiz</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <select name="topicSlug" required className="input-field">
            <option value="">Select topic</option>
            {topics.map((topic) => (
              <option key={topic.id} value={topic.slug}>
                {topic.title}
              </option>
            ))}
          </select>
          <input name="title" placeholder="Quiz title" required className="input-field" />
          <input name="passingScore" placeholder="Passing score %" defaultValue="70" className="input-field" />
          <input name="timeLimitMinutes" placeholder="Time limit (minutes)" defaultValue="10" className="input-field" />
          <input name="xpReward" placeholder="XP reward" defaultValue="30" className="input-field" />
          <select name="status" defaultValue="draft" className="input-field">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <Button type="submit" size="sm" className="mt-4" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Create quiz'}
        </Button>
      </form>

      <AdminDataTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'topic', label: 'Topic', render: (row) => row.topic?.title ?? '—' },
          { key: 'questionCount', label: 'Questions' },
          { key: 'passingScore', label: 'Pass %' },
        ]}
        rows={quizzes}
        onStatusChange={onUpdateStatus}
        onEdit={onEdit}
        onPreview={onPreview}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        statusOptions={['draft', 'published', 'archived']}
      />
    </div>
  );
}

export function AdminContestsPanel({ contests, isSaving, onCreate, onUpdateStatus, onEdit, onDuplicate, onDelete, onPreview }) {
  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border bg-white p-4 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          onCreate({
            title: form.get('title'),
            slug: form.get('slug'),
            description: form.get('description'),
            rules: form.get('rules'),
            difficulty: form.get('difficulty'),
            visibility: form.get('visibility'),
            startTime: form.get('startTime'),
            endTime: form.get('endTime'),
            timeLimitMinutes: form.get('timeLimitMinutes') ? Number(form.get('timeLimitMinutes')) : undefined,
            problemSlugs: String(form.get('problemSlugs'))
              .split(',')
              .map((value) => value.trim())
              .filter(Boolean),
          });
          event.currentTarget.reset();
        }}
      >
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">Create contest</h3>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input name="title" placeholder="Contest title" required className="input-field" />
          <input name="slug" placeholder="slug" required className="input-field" />
          <input name="description" placeholder="Description" className="input-field" />
          <input name="rules" placeholder="Contest rules" className="input-field" />
          <select name="difficulty" defaultValue="medium" className="input-field">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <select name="visibility" defaultValue="public" className="input-field">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <input name="startTime" type="datetime-local" required className="input-field" />
          <input name="endTime" type="datetime-local" required className="input-field" />
          <input name="timeLimitMinutes" placeholder="Per-problem time limit (optional)" className="input-field" />
          <input
            name="problemSlugs"
            placeholder="Problem slugs (comma-separated)"
            required
            className="input-field md:col-span-2 xl:col-span-3"
          />
        </div>
        <Button type="submit" size="sm" className="mt-4" disabled={isSaving}>
          {isSaving ? 'Saving…' : 'Create contest'}
        </Button>
      </form>

      <AdminDataTable
        columns={[
          { key: 'title', label: 'Title' },
          { key: 'slug', label: 'Slug' },
          { key: 'difficulty', label: 'Difficulty', render: (row) => row.difficulty ?? '—' },
          {
            key: 'startTime',
            label: 'Starts',
            render: (row) => new Date(row.startTime).toLocaleString(),
          },
        ]}
        rows={contests}
        statusOptions={['scheduled', 'active', 'completed', 'cancelled', 'archived']}
        onStatusChange={onUpdateStatus}
        onEdit={onEdit}
        onPreview={onPreview}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    </div>
  );
}

export { initialQuizForm, initialContestForm };
