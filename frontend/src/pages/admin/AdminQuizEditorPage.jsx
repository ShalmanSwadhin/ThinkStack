import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../features/admin/adminService';
import Button from '../../components/ui/Button';

export default function AdminQuizEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    topicSlug: '',
    title: '',
    category: '',
    passingScore: 70,
    timeLimitMinutes: 15,
    xpReward: 30,
    status: 'draft',
    visibility: 'public',
    shuffleQuestions: false,
    shuffleOptions: false,
    negativeMarking: { enabled: false, penalty: 0 },
    questions: [{ question: '', options: ['', ''], correctIndex: 0, explanation: '', difficulty: 'easy' }],
  });
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const topicsData = await adminApi.listTopics({ limit: 100 });
      setTopics(topicsData.topics ?? []);
      if (!isNew) {
        const quiz = await adminApi.getQuiz(id);
        setForm((current) => ({
          ...current,
          ...quiz,
          topicSlug: quiz.topic?.slug ?? '',
        }));
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load quiz');
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  const updateQuestion = (index, patch) => {
    const questions = [...form.questions];
    questions[index] = { ...questions[index], ...patch };
    setForm({ ...form, questions });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        passingScore: Number(form.passingScore),
        timeLimitMinutes: Number(form.timeLimitMinutes),
        xpReward: Number(form.xpReward),
      };
      delete payload.topic;

      if (isNew) {
        const created = await adminApi.createQuiz(payload);
        navigate(`/admin/quizzes/${created.id}/edit`, { replace: true });
      } else {
        await adminApi.updateQuiz(id, payload);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save quiz');
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
          <h1 className="page-heading mt-2">{isNew ? 'Create Quiz' : form.title}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && (
            <Link to={`/quizzes/${id}`} target="_blank">
              <Button size="sm" variant="secondary">Preview</Button>
            </Link>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-6">
        <section className="card-base grid gap-4 md:grid-cols-2">
          {isNew && (
            <select value={form.topicSlug} onChange={(e) => setForm({ ...form, topicSlug: e.target.value })} className="input-field">
              <option value="">Select topic</option>
              {topics.map((t) => <option key={t.id} value={t.slug}>{t.title}</option>)}
            </select>
          )}
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" />
          <input type="number" placeholder="Passing %" value={form.passingScore} onChange={(e) => setForm({ ...form, passingScore: e.target.value })} className="input-field" />
          <input type="number" placeholder="Time limit (min)" value={form.timeLimitMinutes} onChange={(e) => setForm({ ...form, timeLimitMinutes: e.target.value })} className="input-field" />
          <input type="number" placeholder="XP reward" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} className="input-field" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
            <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
          <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="input-field">
            <option value="public">Public</option><option value="private">Private</option><option value="unlisted">Unlisted</option>
          </select>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.shuffleQuestions} onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })} /> Shuffle questions</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.shuffleOptions} onChange={(e) => setForm({ ...form, shuffleOptions: e.target.checked })} /> Shuffle options</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.negativeMarking.enabled} onChange={(e) => setForm({ ...form, negativeMarking: { ...form.negativeMarking, enabled: e.target.checked } })} /> Negative marking</label>
          {form.negativeMarking.enabled && (
            <input type="number" placeholder="Penalty" value={form.negativeMarking.penalty} onChange={(e) => setForm({ ...form, negativeMarking: { ...form.negativeMarking, penalty: Number(e.target.value) } })} className="input-field" />
          )}
        </section>

        <section className="card-base space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Questions ({form.questions.length})</h2>
            <Button size="sm" variant="secondary" onClick={() => setForm({ ...form, questions: [...form.questions, { question: '', options: ['', ''], correctIndex: 0, explanation: '', difficulty: 'easy' }] })}>Add question</Button>
          </div>
          {form.questions.map((q, qi) => (
            <div key={qi} className="rounded-xl border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Question {qi + 1}</span>
                <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => setForm({ ...form, questions: form.questions.filter((_, i) => i !== qi) })}>Remove</Button>
              </div>
              <textarea value={q.question} onChange={(e) => updateQuestion(qi, { question: e.target.value })} rows={2} className="input-field mb-2 w-full" placeholder="Question text" />
              {q.options.map((opt, oi) => (
                <div key={oi} className="mb-2 flex gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correctIndex === oi} onChange={() => updateQuestion(qi, { correctIndex: oi })} />
                  <input value={opt} onChange={(e) => { const options = [...q.options]; options[oi] = e.target.value; updateQuestion(qi, { options }); }} className="input-field flex-1" placeholder={`Option ${oi + 1}`} />
                </div>
              ))}
              <Button size="sm" variant="ghost" onClick={() => updateQuestion(qi, { options: [...q.options, ''] })}>Add option</Button>
              <textarea value={q.explanation} onChange={(e) => updateQuestion(qi, { explanation: e.target.value })} rows={2} className="input-field mt-2 w-full" placeholder="Explanation" />
              <select value={q.difficulty} onChange={(e) => updateQuestion(qi, { difficulty: e.target.value })} className="input-field mt-2 w-auto">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
