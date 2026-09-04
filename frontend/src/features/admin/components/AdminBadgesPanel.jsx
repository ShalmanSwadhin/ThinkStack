import { useCallback, useEffect, useState } from 'react';
import adminApi from '../adminService';
import AdminDataTable, { AdminPagination, AdminToolbar } from './AdminDataTable';
import Button from '../../../components/ui/Button';

export default function AdminBadgesPanel({ isSaving, runMutation }) {
  const [badges, setBadges] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({
    slug: '',
    name: '',
    description: '',
    icon: '🏅',
    category: 'general',
    criteria: { type: 'login', threshold: 1 },
    xpBonus: 0,
    isActive: true,
    status: 'published',
  });

  const load = useCallback(async () => {
    const data = await adminApi.listBadges({ page, limit: 20, search });
    setBadges(data.badges ?? []);
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
            await adminApi.createBadge(form);
            setForm({ ...form, slug: '', name: '', description: '' });
            await load();
          });
        }}
      >
        <h3 className="font-semibold">Create badge</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" required />
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          <input placeholder="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field md:col-span-2" required />
          <input placeholder="Criteria type" value={form.criteria.type} onChange={(e) => setForm({ ...form, criteria: { ...form.criteria, type: e.target.value } })} className="input-field" />
          <input type="number" placeholder="Threshold" value={form.criteria.threshold} onChange={(e) => setForm({ ...form, criteria: { ...form.criteria, threshold: Number(e.target.value) } })} className="input-field" />
        </div>
        <Button type="submit" size="sm" className="mt-4" disabled={isSaving}>Create</Button>
      </form>

      <AdminToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search badges…" />
      <AdminDataTable
        columns={[
          { key: 'icon', label: '', render: (r) => r.icon },
          { key: 'name', label: 'Name' },
          { key: 'slug', label: 'Slug' },
          { key: 'category', label: 'Category' },
        ]}
        rows={badges}
        onStatusChange={(badgeId, status) =>
          runMutation(async () => {
            await adminApi.updateBadge(badgeId, { status });
            await load();
          })
        }
        onDelete={(row) =>
          runMutation(async () => {
            if (window.confirm('Delete this badge?')) {
              await adminApi.deleteBadge(row.id);
              await load();
            }
          })
        }
      />
      <AdminPagination meta={meta} page={page} onPageChange={setPage} />
    </div>
  );
}
