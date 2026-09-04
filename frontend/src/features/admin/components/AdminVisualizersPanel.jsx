import { useCallback, useEffect, useState } from 'react';
import adminApi from '../adminService';
import AdminDataTable, { AdminPagination, AdminToolbar } from './AdminDataTable';
import Button from '../../../components/ui/Button';

export default function AdminVisualizersPanel({ isSaving, runMutation }) {
  const [visualizers, setVisualizers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    algorithmId: '',
    name: '',
    category: 'sorting',
    description: '',
    difficulty: 'beginner',
    status: 'published',
    visibility: 'public',
  });

  const load = useCallback(async () => {
    const data = await adminApi.listVisualizers({ page, limit: 30, search });
    setVisualizers(data.visualizers ?? []);
    setMeta(data.meta);
  }, [page, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  return (
    <div className="space-y-6">
      <form
        className="card-base"
        onSubmit={(e) => {
          e.preventDefault();
          runMutation(async () => {
            await adminApi.createVisualizer(form);
            setForm({ ...form, algorithmId: '', name: '', description: '' });
            await load();
          });
        }}
      >
        <h3 className="font-semibold">Create visualizer entry</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input placeholder="Algorithm ID" value={form.algorithmId} onChange={(e) => setForm({ ...form, algorithmId: e.target.value })} className="input-field" required />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field md:col-span-3" rows={2} />
        </div>
        <Button type="submit" size="sm" className="mt-4" disabled={isSaving}>Create</Button>
      </form>

      <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search visualizers…" />
      <AdminDataTable
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'algorithmId', label: 'ID' },
          { key: 'category', label: 'Category' },
          { key: 'difficulty', label: 'Difficulty' },
        ]}
        rows={visualizers}
        onStatusChange={(id, status) =>
          runMutation(async () => {
            await adminApi.updateVisualizer(id, { status });
            await load();
          })
        }
        onDelete={(row) =>
          runMutation(async () => {
            if (window.confirm('Delete visualizer config?')) {
              await adminApi.deleteVisualizer(row.id);
              await load();
            }
          })
        }
      />
      <AdminPagination meta={meta} page={page} onPageChange={setPage} />
    </div>
  );
}
