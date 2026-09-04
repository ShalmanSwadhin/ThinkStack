import {
  LayoutDashboard,
  TrendingUp,
  Trophy,
  BookOpen,
  Play,
  ScanSearch,
  Code2,
  Puzzle,
  CheckCircle2,
  Bot,
  Medal,
  Zap,
  StickyNote,
  Bookmark,
  Settings,
  Shield,
  Users,
  BadgeCheck,
  MonitorPlay,
  Megaphone,
  BarChart3,
} from 'lucide-react';

/** Consistent icon sizes across the navigation system */
export const NAV_ICON_SIZES = {
  sidebar: 22,
  navbar: 20,
  mobile: 22,
  admin: 22,
  settings: 20,
  action: 18,
  small: 16,
};

export const navGroups = [
  {
    id: 'overview',
    label: null,
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    id: 'personal',
    label: 'PERSONAL',
    items: [
      { to: '/progress', label: 'Progress', icon: TrendingUp },
      { to: '/achievements', label: 'Achievements', icon: Trophy },
      { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
      { to: '/notes', label: 'Notes', icon: StickyNote },
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
  {
    id: 'learning',
    label: 'LEARNING',
    items: [
      { to: '/learn', label: 'Learn', icon: BookOpen },
      { to: '/visualizer', label: 'Visualizer', icon: Play },
      { to: '/manual-tracing', label: 'Manual Tracing', icon: ScanSearch },
      { to: '/playground', label: 'Playground', icon: Code2 },
    ],
  },
  {
    id: 'practice',
    label: 'PRACTICE',
    items: [
      { to: '/problems', label: 'Problems', icon: Puzzle },
      { to: '/quizzes', label: 'Quizzes', icon: CheckCircle2 },
      { to: '/contests', label: 'Contests', icon: Zap },
    ],
  },
  {
    id: 'community',
    label: 'COMMUNITY',
    items: [
      { to: '/ai-tutor', label: 'AI Tutor', icon: Bot },
      { to: '/leaderboard', label: 'Leaderboard', icon: Medal },
    ],
  },
];

export const adminNavItem = { to: '/admin', label: 'Admin', icon: Shield };

export const mobileNavItems = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/learn', label: 'Learn', icon: BookOpen },
  { to: '/problems', label: 'Problems', icon: Puzzle },
  { to: '/quizzes', label: 'Quizzes', icon: CheckCircle2 },
  { to: '/settings', label: 'More', icon: Settings },
];

export const adminTabs = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'topics', label: 'Lessons', icon: BookOpen },
  { id: 'problems', label: 'Problems', icon: Puzzle },
  { id: 'quizzes', label: 'Quizzes', icon: CheckCircle2 },
  { id: 'contests', label: 'Contests', icon: Zap },
  { id: 'badges', label: 'Badges', icon: BadgeCheck },
  { id: 'visualizers', label: 'Visualizers', icon: MonitorPlay },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
];
