import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../features/admin/adminService';
import Button from '../../components/ui/Button';

export default function AdminContestEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    rules: '',
    thumbnail: '',
    banner: '',
    difficulty: 'medium',
    visibility: 'public',
    startTime: '',
    endTime: '',
    durationMinutes: '',
    timeLimitMinutes: '',
    status: 'scheduled',
    problemSlugs: '',
    scoring: { pointsPerProblem: 100, penaltyMinutes: 20, partialScoring: false },
    leaderboardSettings: { showPenalty: true, freezeMinutes: 0, publicStandings: true },
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (isNew) return;
    setIsLoading(true);
    try {
      const contest = await adminApi.getContest(id);
      setForm({
        ...contest,
        startTime: contest.startTime ? new Date(contest.startTime).toISOString().slice(0, 16) : '',
        endTime: contest.endTime ? new Date(contest.endTime).toISOString().slice(0, 16) : '',
        problemSlugs: (contest.problems ?? []).map((p) => p.slug).join(', '),
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load contest');
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        problemSlugs: form.problemSlugs.split(',').map((s) => s.trim()).filter(Boolean),
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        timeLimitMinutes: form.timeLimitMinutes ? Number(form.timeLimitMinutes) : undefined,
      };

      if (isNew) {
        const created = await adminApi.createContest(payload);
        navigate(`/admin/contests/${created.id}/edit`, { replace: true });
      } else {
        await adminApi.updateContest(id, payload);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save contest');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>;

  return (
    <div className="page-container py-8 pb-24">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link to="/admin" className="text-sm text-brand-600">← Admin</Link>
          <h1 className="page-heading mt-2">{isNew ? 'Create Contest' : form.title}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && form.slug && (
            <Link to={`/contests/${form.slug}`} target="_blank">
              <Button size="sm" variant="secondary">Preview</Button>
            </Link>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="card-base grid gap-4 md:grid-cols-2">
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
        <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" disabled={!isNew} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="input-field md:col-span-2" />
        <textarea placeholder="Rules" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} rows={3} className="input-field md:col-span-2" />
        <input placeholder="Thumbnail URL" value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="input-field" />
        <input placeholder="Banner URL" value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} className="input-field" />
        <input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="input-field" />
        <input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="input-field" />
        <input type="number" placeholder="Duration (minutes)" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} className="input-field" />
        <input type="number" placeholder="Per-problem time limit" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} className="input-field" />
        <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="input-field">
          <option value="public">Public</option><option value="private">Private</option>
        </select>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
          <option value="scheduled">Scheduled</option><option value="active">Active</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="archived">Archived</option>
        </select>
        <input placeholder="Problem slugs (comma-separated)" value={form.problemSlugs} onChange={(e) => setForm({ ...form, problemSlugs: e.target.value })} className="input-field md:col-span-2" />
        <input type="number" placeholder="Points per problem" value={form.scoring.pointsPerProblem} onChange={(e) => setForm({ ...form, scoring: { ...form.scoring, pointsPerProblem: Number(e.target.value) } })} className="input-field" />
        <input type="number" placeholder="Penalty minutes" value={form.scoring.penaltyMinutes} onChange={(e) => setForm({ ...form, scoring: { ...form.scoring, penaltyMinutes: Number(e.target.value) } })} className="input-field" />
      </div>
    </div>
  );
}
