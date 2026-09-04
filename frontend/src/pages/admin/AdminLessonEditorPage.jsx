import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TOPIC_CATEGORIES, DIFFICULTY } from 'shared/constants';
import adminApi from '../../features/admin/adminService';
import AdminMultiLangCodeEditor, {
  codeExamplesToMap,
  mapToCodeExamples,
} from '../../features/admin/components/AdminMultiLangCodeEditor';
import Button from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const CONTENT_SECTIONS = [
  { key: 'introduction', label: 'Introduction', type: 'textarea' },
  { key: 'theory', label: 'Theory', type: 'markdown' },
  { key: 'explanation', label: 'Explanation', type: 'markdown' },
  { key: 'example', label: 'Examples', type: 'textarea' },
  { key: 'realWorldExample', label: 'Real World Applications', type: 'textarea' },
  { key: 'advantages', label: 'Advantages', type: 'list' },
  { key: 'disadvantages', label: 'Disadvantages', type: 'list' },
  { key: 'applications', label: 'Applications', type: 'list' },
  { key: 'timeComplexity', label: 'Time Complexity', type: 'text' },
  { key: 'spaceComplexity', label: 'Space Complexity', type: 'text' },
  { key: 'commonMistakes', label: 'Common Mistakes', type: 'list' },
  { key: 'interviewQuestions', label: 'Interview Tips', type: 'interview' },
  { key: 'summary', label: 'Summary', type: 'textarea' },
  { key: 'references', label: 'References', type: 'list' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
  { key: 'externalResources', label: 'External Resources', type: 'resources' },
  { key: 'codeComments', label: 'Code Comments', type: 'textarea' },
];

const emptyTopic = {
  slug: '',
  title: '',
  description: '',
  category: TOPIC_CATEGORIES.FUNDAMENTALS,
  difficulty: DIFFICULTY.BEGINNER,
  order: 0,
  status: 'draft',
  visibility: 'public',
  thumbnail: '',
  banner: '',
  estimatedMinutes: 30,
  xpReward: 50,
  tags: [],
  content: {},
  animationConfig: { type: '', defaultParams: {} },
  relatedProblemIds: [],
  prerequisiteIds: [],
  relatedTopicIds: [],
  suggestedTopicIds: [],
  navigation: {
    previousLessonId: null,
    nextLessonId: null,
    relatedLessonIds: [],
    suggestedLessonIds: [],
  },
};

function ListEditor({ items = [], onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  return (
    <div className="space-y-2">
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
            <span className="flex-1">{item}</span>
            <button
              type="button"
              className="text-rose-500"
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="input-field flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft('');
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function InterviewEditor({ items = [], onChange }) {
  const addItem = () => onChange([...items, { question: '', answer: '' }]);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="rounded-xl border p-3">
          <input
            value={item.question}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, question: event.target.value };
              onChange(next);
            }}
            placeholder="Question"
            className="input-field mb-2"
          />
          <textarea
            value={item.answer}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, answer: event.target.value };
              onChange(next);
            }}
            placeholder="Answer"
            rows={2}
            className="input-field w-full"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-2 text-rose-600"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={addItem}>
        Add interview Q&A
      </Button>
    </div>
  );
}

function ResourcesEditor({ items = [], onChange }) {
  const addItem = () => onChange([...items, { title: '', url: '', description: '' }]);

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-3">
          <input
            value={item.title}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, title: event.target.value };
              onChange(next);
            }}
            placeholder="Title"
            className="input-field"
          />
          <input
            value={item.url}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, url: event.target.value };
              onChange(next);
            }}
            placeholder="URL"
            className="input-field"
          />
          <input
            value={item.description}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...item, description: event.target.value };
              onChange(next);
            }}
            placeholder="Description"
            className="input-field"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-rose-600 md:col-span-3"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
          >
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" size="sm" variant="secondary" onClick={addItem}>
        Add resource
      </Button>
    </div>
  );
}

export default function AdminLessonEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [form, setForm] = useState(emptyTopic);
  const [activeSection, setActiveSection] = useState('meta');
  const [allTopics, setAllTopics] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tagsInput, setTagsInput] = useState('');

  const { codeMap, explanationMap } = useMemo(
    () => codeExamplesToMap(form.content?.codeExamples),
    [form.content?.codeExamples]
  );

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topicsData, problemsData] = await Promise.all([
        adminApi.listTopics({ limit: 100 }),
        adminApi.listProblems({ limit: 100 }),
      ]);
      setAllTopics(topicsData.topics ?? []);
      setAllProblems(problemsData.problems ?? []);

      if (!isNew) {
        const topic = await adminApi.getTopic(id);
        setForm({
          ...emptyTopic,
          ...topic,
          content: { ...emptyTopic.content, ...topic.content },
          navigation: { ...emptyTopic.navigation, ...topic.navigation },
        });
        setTagsInput((topic.tags ?? []).join(', '));
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load lesson');
    } finally {
      setIsLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    load();
  }, [load]);

  const updateContent = (key, value) => {
    setForm((current) => ({
      ...current,
      content: { ...current.content, [key]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tags: tagsInput
          .split(',')
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        order: Number(form.order),
        estimatedMinutes: Number(form.estimatedMinutes),
        xpReward: Number(form.xpReward),
      };

      if (isNew) {
        const created = await adminApi.createTopic({
          slug: form.slug,
          title: form.title,
          category: form.category,
          difficulty: form.difficulty,
          order: payload.order,
          status: form.status,
        });
        await adminApi.updateTopic(created.id, payload);
        navigate(`/admin/topics/${created.id}/edit`, { replace: true });
      } else {
        await adminApi.updateTopic(id, payload);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save lesson');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>;
  }

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link to="/admin" className="text-sm text-brand-600 hover:underline">
            ← Back to admin
          </Link>
          <h1 className="page-heading mt-2">{isNew ? 'Create Lesson' : `Edit: ${form.title}`}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && form.slug && (
            <Link to={`/learn/${form.slug}`} target="_blank">
              <Button size="sm" variant="secondary">Preview</Button>
            </Link>
          )}
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save lesson'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="space-y-1 rounded-xl border bg-white p-3 dark:bg-slate-900">
          {[
            { id: 'meta', label: 'Metadata' },
            ...CONTENT_SECTIONS.map((s) => ({ id: s.key, label: s.label })),
            { id: 'code', label: 'Real Code' },
            { id: 'navigation', label: 'Navigation' },
            { id: 'animation', label: 'Animation' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'block w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
                activeSection === item.id
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="card-base space-y-4">
          {activeSection === 'meta' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Title</span>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Slug</span>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field mt-1" disabled={!isNew} />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Description</span>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="input-field mt-1 w-full" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Category</span>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field mt-1">
                  {Object.values(TOPIC_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Difficulty</span>
                <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="input-field mt-1">
                  {[DIFFICULTY.BEGINNER, DIFFICULTY.INTERMEDIATE, DIFFICULTY.ADVANCED].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Order</span>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Estimated minutes</span>
                <input type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">XP reward</span>
                <input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Status</span>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input-field mt-1">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Visibility</span>
                <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })} className="input-field mt-1">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="unlisted">Unlisted</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Thumbnail URL</span>
                <input value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Banner URL</span>
                <input value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} className="input-field mt-1" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Tags (comma-separated)</span>
                <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="input-field mt-1" />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Related problems</span>
                <select
                  multiple
                  value={form.relatedProblemIds}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      relatedProblemIds: Array.from(e.target.selectedOptions, (o) => o.value),
                    })
                  }
                  className="input-field mt-1 h-32"
                >
                  {allProblems.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Prerequisites</span>
                <select
                  multiple
                  value={form.prerequisiteIds}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      prerequisiteIds: Array.from(e.target.selectedOptions, (o) => o.value),
                    })
                  }
                  className="input-field mt-1 h-32"
                >
                  {allTopics.filter((t) => t.id !== id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {CONTENT_SECTIONS.map((section) =>
            activeSection === section.key ? (
              <div key={section.key}>
                <h2 className="mb-4 text-lg font-semibold">{section.label}</h2>
                {section.type === 'list' && (
                  <ListEditor
                    items={form.content?.[section.key] ?? []}
                    onChange={(value) => updateContent(section.key, value)}
                    placeholder={`Add ${section.label.toLowerCase()}…`}
                  />
                )}
                {section.type === 'interview' && (
                  <InterviewEditor
                    items={form.content?.interviewQuestions ?? []}
                    onChange={(value) => updateContent('interviewQuestions', value)}
                  />
                )}
                {section.type === 'resources' && (
                  <ResourcesEditor
                    items={form.content?.externalResources ?? []}
                    onChange={(value) => updateContent('externalResources', value)}
                  />
                )}
                {(section.type === 'textarea' || section.type === 'markdown') && (
                  <textarea
                    value={form.content?.[section.key] ?? ''}
                    onChange={(e) => updateContent(section.key, e.target.value)}
                    rows={10}
                    className="input-field w-full font-mono text-sm"
                  />
                )}
                {section.type === 'text' && (
                  <input
                    value={form.content?.[section.key] ?? ''}
                    onChange={(e) => updateContent(section.key, e.target.value)}
                    className="input-field w-full"
                  />
                )}
              </div>
            ) : null
          )}

          {activeSection === 'code' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Real Code</h2>
              <AdminMultiLangCodeEditor
                value={codeMap}
                explanations={explanationMap}
                onChange={(codeMapNext) =>
                  updateContent('codeExamples', mapToCodeExamples(codeMapNext, explanationMap))
                }
                onExplanationChange={(explanationMapNext) =>
                  updateContent('codeExamples', mapToCodeExamples(codeMap, explanationMapNext))
                }
              />
            </div>
          )}

          {activeSection === 'navigation' && (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium">Previous lesson</span>
                <select
                  value={form.navigation?.previousLessonId ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navigation: { ...form.navigation, previousLessonId: e.target.value || null },
                    })
                  }
                  className="input-field mt-1"
                >
                  <option value="">None</option>
                  {allTopics.filter((t) => t.id !== id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-medium">Next lesson</span>
                <select
                  value={form.navigation?.nextLessonId ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navigation: { ...form.navigation, nextLessonId: e.target.value || null },
                    })
                  }
                  className="input-field mt-1"
                >
                  <option value="">None</option>
                  {allTopics.filter((t) => t.id !== id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Related lessons</span>
                <select
                  multiple
                  value={form.navigation?.relatedLessonIds ?? []}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navigation: {
                        ...form.navigation,
                        relatedLessonIds: Array.from(e.target.selectedOptions, (o) => o.value),
                      },
                    })
                  }
                  className="input-field mt-1 h-32"
                >
                  {allTopics.filter((t) => t.id !== id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm font-medium">Suggested lessons</span>
                <select
                  multiple
                  value={form.navigation?.suggestedLessonIds ?? []}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      navigation: {
                        ...form.navigation,
                        suggestedLessonIds: Array.from(e.target.selectedOptions, (o) => o.value),
                      },
                    })
                  }
                  className="input-field mt-1 h-32"
                >
                  {allTopics.filter((t) => t.id !== id).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {activeSection === 'animation' && (
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-medium">Visualizer algorithm type</span>
                <input
                  value={form.animationConfig?.type ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      animationConfig: { ...form.animationConfig, type: e.target.value },
                    })
                  }
                  className="input-field mt-1"
                  placeholder="e.g. bubble-sort"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Default params (JSON)</span>
                <textarea
                  value={JSON.stringify(form.animationConfig?.defaultParams ?? {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setForm({
                        ...form,
                        animationConfig: { ...form.animationConfig, defaultParams: parsed },
                      });
                    } catch {
                      /* ignore invalid JSON while typing */
                    }
                  }}
                  rows={6}
                  className="input-field w-full font-mono text-sm"
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
