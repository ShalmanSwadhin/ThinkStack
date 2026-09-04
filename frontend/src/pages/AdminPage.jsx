import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import adminApi from '../features/admin/adminService';
import { useAdmin } from '../features/admin/useAdmin';
import AdminOverviewCards from '../features/admin/components/AdminOverviewCards';
import { AdminTrendChart, AdminPopularTopicsChart } from '../features/admin/components/AdminCharts';
import AdminUsersPanel from '../features/admin/components/AdminUsersPanel';
import AdminAnnouncementsPanel from '../features/admin/components/AdminAnnouncementsPanel';
import { AdminQuizzesPanel, AdminContestsPanel } from '../features/admin/components/AdminQuizzesContestsPanels';
import AdminDataTable, { AdminToolbar, AdminPagination } from '../features/admin/components/AdminDataTable';
import AdminBadgesPanel from '../features/admin/components/AdminBadgesPanel';
import AdminVisualizersPanel from '../features/admin/components/AdminVisualizersPanel';
import AdminSettingsPanel from '../features/admin/components/AdminSettingsPanel';
import { AdminQuickCreate } from '../features/admin/components/AdminEntityTable';
import Button from '../components/ui/Button';
import { cn } from '../utils/cn';
import { adminTabs, NAV_ICON_SIZES } from '../components/layout/navConfig';
import NavIcon from '../components/layout/NavIcon';

const initialTopicForm = {
  slug: '',
  title: '',
  category: 'fundamentals',
  difficulty: 'beginner',
  order: '0',
  status: 'draft',
};

const initialProblemForm = {
  slug: '',
  title: '',
  description: '',
  difficulty: 'easy',
  status: 'draft',
};

const initialAnnouncementForm = {
  title: '',
  content: '',
  priority: 'normal',
  isActive: true,
};

function EntityListPanel({
  entityType,
  rows,
  meta,
  columns,
  search,
  onSearchChange,
  page,
  onPageChange,
  statusFilter,
  onStatusFilterChange,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onEdit,
  onPreview,
  onDuplicate,
  onDelete,
  onArchive,
  onRestore,
  onStatusChange,
  onBulkArchive,
  statusOptions,
  createForm,
}) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        {createForm}
        <Link to={`/admin/${entityType}/new/edit`}>
          <Button size="sm">Open full editor</Button>
        </Link>
      </div>
      <AdminToolbar
        search={search}
        onSearchChange={onSearchChange}
        filters={
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        }
        selectedCount={selectedIds.length}
        bulkActions={
          selectedIds.length > 0 && (
            <Button size="sm" variant="secondary" onClick={() => onBulkArchive(selectedIds)}>
              Archive selected
            </Button>
          )
        }
      />
      <AdminDataTable
        columns={columns}
        rows={rows}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        onEdit={onEdit}
        onPreview={onPreview}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        onArchive={onArchive}
        onRestore={onRestore}
        onStatusChange={onStatusChange}
        statusOptions={statusOptions}
      />
      <AdminPagination meta={meta} page={page} onPageChange={onPageChange} />
    </>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const {
    activeTab,
    setActiveTab,
    analytics,
    users,
    topics,
    problems,
    quizzes,
    contests,
    announcements,
    topicsMeta,
    problemsMeta,
    topicsSearch,
    setTopicsSearch,
    problemsSearch,
    setProblemsSearch,
    topicsPage,
    setTopicsPage,
    problemsPage,
    setProblemsPage,
    topicsStatusFilter,
    setTopicsStatusFilter,
    problemsStatusFilter,
    setProblemsStatusFilter,
    selectedTopicIds,
    selectedProblemIds,
    toggleTopicSelect,
    toggleProblemSelect,
    toggleAllTopics,
    toggleAllProblems,
    isLoading,
    isSaving,
    error,
    runMutation,
    exportReport,
    refetch,
  } = useAdmin();

  const [topicForm, setTopicForm] = useState(initialTopicForm);
  const [problemForm, setProblemForm] = useState(initialProblemForm);
  const [announcementForm, setAnnouncementForm] = useState(initialAnnouncementForm);

  const topicActions = {
    onEdit: (row) => navigate(`/admin/topics/${row.id}/edit`),
    onPreview: (row) => window.open(`/learn/${row.slug}`, '_blank'),
    onDuplicate: (row) => runMutation(() => adminApi.duplicateTopic(row.id), 'topics'),
    onDelete: (row) => {
      if (window.confirm('Permanently delete this lesson?')) {
        runMutation(() => adminApi.deleteTopic(row.id), 'topics');
      }
    },
    onArchive: (row) => runMutation(() => adminApi.updateTopic(row.id, { status: 'archived' }), 'topics'),
    onRestore: (row) => runMutation(() => adminApi.updateTopic(row.id, { status: 'draft' }), 'topics'),
    onStatusChange: (id, status) => runMutation(() => adminApi.updateTopic(id, { status }), 'topics'),
    onBulkArchive: (ids) => runMutation(() => adminApi.bulkUpdateTopics({ ids, status: 'archived' }), 'topics'),
  };

  const problemActions = {
    onEdit: (row) => navigate(`/admin/problems/${row.id}/edit`),
    onPreview: (row) => window.open(`/problems/${row.slug}`, '_blank'),
    onDuplicate: (row) => runMutation(() => adminApi.duplicateProblem(row.id), 'problems'),
    onDelete: (row) => {
      if (window.confirm('Permanently delete this problem?')) {
        runMutation(() => adminApi.deleteProblem(row.id), 'problems');
      }
    },
    onArchive: (row) => runMutation(() => adminApi.updateProblem(row.id, { status: 'archived' }), 'problems'),
    onRestore: (row) => runMutation(() => adminApi.updateProblem(row.id, { status: 'draft' }), 'problems'),
    onStatusChange: (id, status) => runMutation(() => adminApi.updateProblem(id, { status }), 'problems'),
    onBulkArchive: (ids) => runMutation(() => adminApi.bulkUpdateProblems({ ids, status: 'archived' }), 'problems'),
  };

  return (
    <div className="page-container py-8 pb-24 lg:pb-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="page-heading">Admin CMS</h1>
            <p className="page-subheading">
              Manage lessons, problems, quizzes, contests, badges, and platform settings.
            </p>
          </div>
          {activeTab === 'overview' && (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={() => exportReport('users')}>
                Export users CSV
              </Button>
              <Button size="sm" variant="secondary" onClick={() => exportReport('submissions')}>
                Export submissions CSV
              </Button>
            </div>
          )}
        </div>

        <nav
          className="mb-6 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none"
          aria-label="Admin sections"
        >
          {adminTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={cn(
                'relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                activeTab === tab.id
                  ? 'bg-brand-600 font-semibold text-white shadow-soft'
                  : 'border border-slate-200/80 bg-white text-slate-600 shadow-soft hover:border-brand-200 hover:bg-brand-50/50 hover:text-brand-700 dark:border-slate-700/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-brand-800 dark:hover:bg-brand-950/40 dark:hover:text-brand-300'
              )}
            >
              <NavIcon
                icon={tab.icon}
                size={NAV_ICON_SIZES.admin}
                isActive={activeTab === tab.id}
                className={activeTab === tab.id ? 'text-white' : undefined}
              />
              {tab.label}
            </button>
          ))}
        </nav>

        {error && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
            <span>{error}</span>
            <Button size="sm" variant="secondary" onClick={refetch}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="skeleton h-96 rounded-2xl" />
        ) : (
          <>
            {activeTab === 'overview' && analytics && (
              <div className="space-y-6">
                <AdminOverviewCards overview={analytics.overview} />
                <div className="grid gap-6 xl:grid-cols-2">
                  <AdminTrendChart
                    title="User Growth"
                    description="New registrations over the last 30 days"
                    timeline={analytics.userGrowth}
                    label="New users"
                  />
                  <AdminTrendChart
                    title="Submission Activity"
                    description="Code submissions over the last 30 days"
                    timeline={analytics.submissionActivity}
                    label="Submissions"
                  />
                </div>
                <AdminPopularTopicsChart topics={analytics.popularTopics} />
              </div>
            )}

            {activeTab === 'users' && (
              <AdminUsersPanel
                users={users}
                isSaving={isSaving}
                onUpdateUser={(id, payload) =>
                  runMutation(() => adminApi.updateUser(id, payload), 'users')
                }
              />
            )}

            {activeTab === 'topics' && (
              <EntityListPanel
                entityType="topics"
                rows={topics}
                meta={topicsMeta}
                search={topicsSearch}
                onSearchChange={setTopicsSearch}
                page={topicsPage}
                onPageChange={setTopicsPage}
                statusFilter={topicsStatusFilter}
                onStatusFilterChange={setTopicsStatusFilter}
                selectedIds={selectedTopicIds}
                onToggleSelect={toggleTopicSelect}
                onToggleSelectAll={toggleAllTopics}
                statusOptions={['draft', 'published', 'archived']}
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'slug', label: 'Slug' },
                  { key: 'category', label: 'Category' },
                  { key: 'difficulty', label: 'Difficulty' },
                  { key: 'order', label: 'Order' },
                ]}
                createForm={
                  <AdminQuickCreate
                    title="Quick create lesson"
                    values={topicForm}
                    onChange={(patch) => setTopicForm((c) => ({ ...c, ...patch }))}
                    isSaving={isSaving}
                    onSubmit={() =>
                      runMutation(async () => {
                        const created = await adminApi.createTopic({
                          ...topicForm,
                          order: Number(topicForm.order),
                        });
                        setTopicForm(initialTopicForm);
                        navigate(`/admin/topics/${created.id}/edit`);
                      }, 'topics')
                    }
                    fields={[
                      { name: 'slug', placeholder: 'slug', required: true },
                      { name: 'title', placeholder: 'Title', required: true },
                      { name: 'category', placeholder: 'Category', required: true },
                      { name: 'status', placeholder: 'draft or published', required: true },
                    ]}
                  />
                }
                {...topicActions}
              />
            )}

            {activeTab === 'problems' && (
              <EntityListPanel
                entityType="problems"
                rows={problems}
                meta={problemsMeta}
                search={problemsSearch}
                onSearchChange={setProblemsSearch}
                page={problemsPage}
                onPageChange={setProblemsPage}
                statusFilter={problemsStatusFilter}
                onStatusFilterChange={setProblemsStatusFilter}
                selectedIds={selectedProblemIds}
                onToggleSelect={toggleProblemSelect}
                onToggleSelectAll={toggleAllProblems}
                statusOptions={['draft', 'published', 'archived']}
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'slug', label: 'Slug' },
                  { key: 'difficulty', label: 'Difficulty' },
                  {
                    key: 'acceptanceRate',
                    label: 'Acceptance',
                    render: (row) => `${row.acceptanceRate}%`,
                  },
                ]}
                createForm={
                  <AdminQuickCreate
                    title="Quick create problem"
                    values={problemForm}
                    onChange={(patch) => setProblemForm((c) => ({ ...c, ...patch }))}
                    isSaving={isSaving}
                    onSubmit={() =>
                      runMutation(async () => {
                        const created = await adminApi.createProblem({
                          ...problemForm,
                          testCases: [{ input: '1 2', expectedOutput: '3', isHidden: false }],
                        });
                        setProblemForm(initialProblemForm);
                        navigate(`/admin/problems/${created.id}/edit`);
                      }, 'problems')
                    }
                    fields={[
                      { name: 'slug', placeholder: 'slug', required: true },
                      { name: 'title', placeholder: 'Title', required: true },
                      { name: 'description', placeholder: 'Description', required: true },
                      { name: 'status', placeholder: 'draft or published', required: true },
                    ]}
                  />
                }
                {...problemActions}
              />
            )}

            {activeTab === 'quizzes' && (
              <AdminQuizzesPanel
                quizzes={quizzes}
                topics={topics}
                isSaving={isSaving}
                onCreate={(payload) =>
                  runMutation(async () => {
                    const created = await adminApi.createQuiz(payload);
                    navigate(`/admin/quizzes/${created.id}/edit`);
                  }, 'quizzes')
                }
                onUpdateStatus={(id, status) =>
                  runMutation(() => adminApi.updateQuiz(id, { status }), 'quizzes')
                }
                onEdit={(row) => navigate(`/admin/quizzes/${row.id}/edit`)}
                onDuplicate={(row) => runMutation(() => adminApi.duplicateQuiz(row.id), 'quizzes')}
                onDelete={(row) => {
                  if (window.confirm('Delete quiz?')) {
                    runMutation(() => adminApi.deleteQuiz(row.id), 'quizzes');
                  }
                }}
                onPreview={(row) => window.open(`/quizzes/${row.id}`, '_blank')}
              />
            )}

            {activeTab === 'contests' && (
              <AdminContestsPanel
                contests={contests}
                isSaving={isSaving}
                onCreate={(payload) =>
                  runMutation(async () => {
                    const created = await adminApi.createContest(payload);
                    navigate(`/admin/contests/${created.id}/edit`);
                  }, 'contests')
                }
                onUpdateStatus={(id, status) =>
                  runMutation(() => adminApi.updateContest(id, { status }), 'contests')
                }
                onEdit={(row) => navigate(`/admin/contests/${row.id}/edit`)}
                onDuplicate={(row) => runMutation(() => adminApi.duplicateContest(row.id), 'contests')}
                onDelete={(row) => {
                  if (window.confirm('Delete contest?')) {
                    runMutation(() => adminApi.deleteContest(row.id), 'contests');
                  }
                }}
                onPreview={(row) => window.open(`/contests/${row.slug}`, '_blank')}
              />
            )}

            {activeTab === 'badges' && (
              <AdminBadgesPanel isSaving={isSaving} runMutation={runMutation} />
            )}

            {activeTab === 'visualizers' && (
              <AdminVisualizersPanel isSaving={isSaving} runMutation={runMutation} />
            )}

            {activeTab === 'settings' && (
              <AdminSettingsPanel isSaving={isSaving} runMutation={runMutation} />
            )}

            {activeTab === 'announcements' && (
              <AdminAnnouncementsPanel
                announcements={announcements}
                form={announcementForm}
                onChange={(patch) =>
                  setAnnouncementForm((current) => ({ ...current, ...patch }))
                }
                isSaving={isSaving}
                onSubmit={() =>
                  runMutation(async () => {
                    await adminApi.createAnnouncement(announcementForm);
                    setAnnouncementForm(initialAnnouncementForm);
                  }, 'announcements')
                }
                onToggleActive={(id, payload) =>
                  runMutation(() => adminApi.updateAnnouncement(id, payload), 'announcements')
                }
              />
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
