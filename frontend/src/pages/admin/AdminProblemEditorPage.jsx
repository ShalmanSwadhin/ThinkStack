import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DIFFICULTY } from 'shared/constants';
import { CODE_LANGUAGES } from 'shared/algorithms/codeSync/languages.js';
import adminApi from '../../features/admin/adminService';
import AdminMultiLangCodeEditor from '../../features/admin/components/AdminMultiLangCodeEditor';
import Button from '../../components/ui/Button';

const LANG_KEYS = CODE_LANGUAGES.map((l) => l.id);

export default function AdminProblemEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState({
    slug: '',
    title: '',
    description: '',
    difficulty: DIFFICULTY.EASY,
    status: 'draft',
    constraints: '',
    hints: [],
    editorial: '',
    tags: '',
    companies: '',
    topicSlugs: '',
    examples: [{ input: '', output: '', explanation: '' }],
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    starterCode: {},
    boilerplateCode: {},
    referenceSolution: { language: 'python', code: '' },
    timeLimitMs: 2000,
    memoryLimitKb: 256000,
    supportedLanguages: LANG_KEYS,
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (isNew) return;
    setIsLoading(true);
    try {
      const problem = await adminApi.getProblem(id);
      setForm({
        ...problem,
        tags: (problem.tags ?? []).join(', '),
        companies: (problem.companies ?? []).join(', '),
        topicSlugs: (problem.topicSlugs ?? []).join(', '),
      });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load problem');
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
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        companies: form.companies.split(',').map((t) => t.trim()).filter(Boolean),
        topicSlugs: form.topicSlugs.split(',').map((t) => t.trim()).filter(Boolean),
        timeLimitMs: Number(form.timeLimitMs),
        memoryLimitKb: Number(form.memoryLimitKb),
      };

      if (isNew) {
        const created = await adminApi.createProblem(payload);
        navigate(`/admin/problems/${created.id}/edit`, { replace: true });
      } else {
        await adminApi.updateProblem(id, payload);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save problem');
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
          <h1 className="page-heading mt-2">{isNew ? 'Create Problem' : form.title}</h1>
        </div>
        <div className="flex gap-2">
          {!isNew && form.slug && (
            <Link to={`/problems/${form.slug}`} target="_blank">
              <Button size="sm" variant="secondary">Preview</Button>
            </Link>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving…' : 'Save'}</Button>
        </div>
      </div>
      {error && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-6">
        <section className="card-base grid gap-4 md:grid-cols-2">
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" disabled={!isNew} />
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" />
          <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field">
            {[DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field">
            <option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option>
          </select>
          <input placeholder="Tags (comma-separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field md:col-span-2" />
          <input placeholder="Companies" value={form.companies} onChange={(e) => setForm({ ...form, companies: e.target.value })} className="input-field" />
          <input placeholder="Topic slugs" value={form.topicSlugs} onChange={(e) => setForm({ ...form, topicSlugs: e.target.value })} className="input-field" />
          <input type="number" placeholder="Time limit (ms)" value={form.timeLimitMs} onChange={(e) => setForm({ ...form, timeLimitMs: e.target.value })} className="input-field" />
          <input type="number" placeholder="Memory limit (KB)" value={form.memoryLimitKb} onChange={(e) => setForm({ ...form, memoryLimitKb: e.target.value })} className="input-field" />
        </section>

        <section className="card-base">
          <h2 className="mb-3 font-semibold">Description</h2>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={8} className="input-field w-full" />
          <h2 className="mb-3 mt-4 font-semibold">Constraints</h2>
          <textarea value={form.constraints} onChange={(e) => setForm({ ...form, constraints: e.target.value })} rows={3} className="input-field w-full" />
          <h2 className="mb-3 mt-4 font-semibold">Editorial</h2>
          <textarea value={form.editorial} onChange={(e) => setForm({ ...form, editorial: e.target.value })} rows={5} className="input-field w-full" />
        </section>

        <section className="card-base">
          <h2 className="mb-3 font-semibold">Examples</h2>
          {form.examples.map((ex, i) => (
            <div key={i} className="mb-3 grid gap-2 md:grid-cols-3">
              <input placeholder="Input" value={ex.input} onChange={(e) => { const next = [...form.examples]; next[i] = { ...ex, input: e.target.value }; setForm({ ...form, examples: next }); }} className="input-field" />
              <input placeholder="Output" value={ex.output} onChange={(e) => { const next = [...form.examples]; next[i] = { ...ex, output: e.target.value }; setForm({ ...form, examples: next }); }} className="input-field" />
              <input placeholder="Explanation" value={ex.explanation ?? ''} onChange={(e) => { const next = [...form.examples]; next[i] = { ...ex, explanation: e.target.value }; setForm({ ...form, examples: next }); }} className="input-field" />
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setForm({ ...form, examples: [...form.examples, { input: '', output: '', explanation: '' }] })}>Add example</Button>
        </section>

        <section className="card-base">
          <h2 className="mb-3 font-semibold">Test cases</h2>
          {form.testCases.map((tc, i) => (
            <div key={i} className="mb-3 grid gap-2 md:grid-cols-3">
              <input placeholder="Input" value={tc.input} onChange={(e) => { const next = [...form.testCases]; next[i] = { ...tc, input: e.target.value }; setForm({ ...form, testCases: next }); }} className="input-field" />
              <input placeholder="Expected output" value={tc.expectedOutput} onChange={(e) => { const next = [...form.testCases]; next[i] = { ...tc, expectedOutput: e.target.value }; setForm({ ...form, testCases: next }); }} className="input-field" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={tc.isHidden} onChange={(e) => { const next = [...form.testCases]; next[i] = { ...tc, isHidden: e.target.checked }; setForm({ ...form, testCases: next }); }} /> Hidden</label>
            </div>
          ))}
          <Button size="sm" variant="secondary" onClick={() => setForm({ ...form, testCases: [...form.testCases, { input: '', expectedOutput: '', isHidden: false }] })}>Add test case</Button>
        </section>

        <section className="card-base">
          <h2 className="mb-3 font-semibold">Starter code</h2>
          <AdminMultiLangCodeEditor value={form.starterCode} onChange={(starterCode) => setForm({ ...form, starterCode })} />
        </section>

        <section className="card-base">
          <h2 className="mb-3 font-semibold">Reference solution</h2>
          <select value={form.referenceSolution.language} onChange={(e) => setForm({ ...form, referenceSolution: { ...form.referenceSolution, language: e.target.value } })} className="input-field mb-2 w-auto">
            {LANG_KEYS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
          <textarea value={form.referenceSolution.code} onChange={(e) => setForm({ ...form, referenceSolution: { ...form.referenceSolution, code: e.target.value } })} rows={10} className="input-field w-full font-mono text-sm" />
        </section>
      </div>
    </div>
  );
}
