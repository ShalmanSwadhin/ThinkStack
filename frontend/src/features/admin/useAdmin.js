import { useCallback, useEffect, useState } from 'react';
import adminApi from './adminService';

export function useAdmin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [topics, setTopics] = useState([]);
  const [problems, setProblems] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [contests, setContests] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [topicsMeta, setTopicsMeta] = useState(null);
  const [problemsMeta, setProblemsMeta] = useState(null);
  const [topicsSearch, setTopicsSearch] = useState('');
  const [problemsSearch, setProblemsSearch] = useState('');
  const [topicsPage, setTopicsPage] = useState(1);
  const [problemsPage, setProblemsPage] = useState(1);
  const [topicsStatusFilter, setTopicsStatusFilter] = useState('');
  const [problemsStatusFilter, setProblemsStatusFilter] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState([]);
  const [selectedProblemIds, setSelectedProblemIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  const loadOverview = useCallback(async () => {
    const data = await adminApi.getAnalytics();
    setAnalytics(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const data = await adminApi.listUsers({ limit: 50 });
    setUsers(data.users ?? []);
  }, []);

  const loadTopics = useCallback(async () => {
    const params = { page: topicsPage, limit: 20 };
    if (topicsSearch.trim()) params.search = topicsSearch.trim();
    if (topicsStatusFilter) params.status = topicsStatusFilter;
    const data = await adminApi.listTopics(params);
    setTopics(data.topics ?? []);
    setTopicsMeta(data.meta ?? null);
    setSelectedTopicIds([]);
  }, [topicsPage, topicsSearch, topicsStatusFilter]);

  const loadProblems = useCallback(async () => {
    const params = { page: problemsPage, limit: 20 };
    if (problemsSearch.trim()) params.search = problemsSearch.trim();
    if (problemsStatusFilter) params.status = problemsStatusFilter;
    const data = await adminApi.listProblems(params);
    setProblems(data.problems ?? []);
    setProblemsMeta(data.meta ?? null);
    setSelectedProblemIds([]);
  }, [problemsPage, problemsSearch, problemsStatusFilter]);

  const loadQuizzes = useCallback(async () => {
    const data = await adminApi.listQuizzes({ limit: 50 });
    setQuizzes(data.quizzes ?? []);
  }, []);

  const loadContests = useCallback(async () => {
    const data = await adminApi.listContests({ limit: 50 });
    setContests(data.contests ?? []);
  }, []);

  const loadAnnouncements = useCallback(async () => {
    const data = await adminApi.listAnnouncements({ limit: 20 });
    setAnnouncements(data.announcements ?? []);
  }, []);

  const loadTab = useCallback(async (tab) => {
    setIsLoading(true);
    setError(null);
    try {
      if (tab === 'overview') await loadOverview();
      if (tab === 'users') await loadUsers();
      if (tab === 'topics') await loadTopics();
      if (tab === 'problems') await loadProblems();
      if (tab === 'quizzes') await loadQuizzes();
      if (tab === 'contests') await loadContests();
      if (tab === 'badges') return;
      if (tab === 'visualizers') return;
      if (tab === 'settings') return;
      if (tab === 'announcements') await loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  }, [
    loadAnnouncements,
    loadContests,
    loadOverview,
    loadProblems,
    loadQuizzes,
    loadTopics,
    loadUsers,
  ]);

  useEffect(() => {
    loadTab(activeTab);
  }, [activeTab, loadTab]);

  useEffect(() => {
    if (activeTab === 'topics') loadTopics();
  }, [activeTab, loadTopics]);

  useEffect(() => {
    if (activeTab === 'problems') loadProblems();
  }, [activeTab, loadProblems]);

  const handleTopicsSearchChange = useCallback((value) => {
    setTopicsSearch(value);
    setTopicsPage(1);
  }, []);

  const handleTopicsStatusFilterChange = useCallback((value) => {
    setTopicsStatusFilter(value);
    setTopicsPage(1);
  }, []);

  const handleProblemsSearchChange = useCallback((value) => {
    setProblemsSearch(value);
    setProblemsPage(1);
  }, []);

  const handleProblemsStatusFilterChange = useCallback((value) => {
    setProblemsStatusFilter(value);
    setProblemsPage(1);
  }, []);

  const runMutation = useCallback(
    async (mutation, tab = activeTab) => {
      setIsSaving(true);
      setError(null);
      try {
        await mutation();
        await loadTab(tab);
        if (tab === 'topics') await loadTopics();
        if (tab === 'problems') await loadProblems();
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Admin action failed');
      } finally {
        setIsSaving(false);
      }
    },
    [activeTab, loadTab, loadTopics, loadProblems]
  );

  const exportReport = useCallback(async (type) => {
    try {
      const blob = await adminApi.exportReport(type);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'users' ? 'thinkstack-users.csv' : 'thinkstack-submissions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Export failed');
    }
  }, []);

  const toggleTopicSelect = (id) => {
    setSelectedTopicIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  };

  const toggleProblemSelect = (id) => {
    setSelectedProblemIds((current) =>
      current.includes(id) ? current.filter((v) => v !== id) : [...current, id]
    );
  };

  const toggleAllTopics = () => {
    setSelectedTopicIds((current) =>
      current.length === topics.length ? [] : topics.map((t) => t.id)
    );
  };

  const toggleAllProblems = () => {
    setSelectedProblemIds((current) =>
      current.length === problems.length ? [] : problems.map((p) => p.id)
    );
  };

  return {
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
    setTopicsSearch: handleTopicsSearchChange,
    problemsSearch,
    setProblemsSearch: handleProblemsSearchChange,
    topicsPage,
    setTopicsPage,
    problemsPage,
    setProblemsPage,
    topicsStatusFilter,
    setTopicsStatusFilter: handleTopicsStatusFilterChange,
    problemsStatusFilter,
    setProblemsStatusFilter: handleProblemsStatusFilterChange,
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
    refetch: () => loadTab(activeTab),
  };
}

export default useAdmin;
