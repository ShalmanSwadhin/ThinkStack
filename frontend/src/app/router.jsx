import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout, AppLayout } from '../components/layout/MainLayout';
import ScrollToTop from '../components/layout/ScrollToTop';
import ProtectedRoute from '../features/auth/ProtectedRoute';
import GuestRoute from '../features/auth/GuestRoute';
import LandingPage from '../pages/LandingPage';
import DashboardPage from '../pages/DashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import LearnPage from '../pages/LearnPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

const TopicReaderPage = lazy(() => import('../pages/TopicReaderPage'));
const VisualizerPage = lazy(() => import('../pages/VisualizerPage'));
const VisualizerWorkspacePage = lazy(() => import('../pages/VisualizerWorkspacePage'));
const PlaygroundPage = lazy(() => import('../pages/PlaygroundPage'));
const ProblemsPage = lazy(() => import('../pages/ProblemsPage'));
const ProblemDetailPage = lazy(() => import('../pages/ProblemDetailPage'));
const QuizzesPage = lazy(() => import('../pages/QuizzesPage'));
const QuizTakePage = lazy(() => import('../pages/QuizTakePage'));
const AITutorPage = lazy(() => import('../pages/AITutorPage'));
const NotesPage = lazy(() => import('../pages/NotesPage'));
const ProgressPage = lazy(() => import('../pages/ProgressPage'));
const AchievementsPage = lazy(() => import('../pages/AchievementsPage'));
const LeaderboardPage = lazy(() => import('../pages/LeaderboardPage'));
const ContestsPage = lazy(() => import('../pages/ContestsPage'));
const ContestDetailPage = lazy(() => import('../pages/ContestDetailPage'));
const ContestProblemPage = lazy(() => import('../pages/ContestProblemPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));
const AdminLessonEditorPage = lazy(() => import('../pages/admin/AdminLessonEditorPage'));
const AdminProblemEditorPage = lazy(() => import('../pages/admin/AdminProblemEditorPage'));
const AdminQuizEditorPage = lazy(() => import('../pages/admin/AdminQuizEditorPage'));
const AdminContestEditorPage = lazy(() => import('../pages/admin/AdminContestEditorPage'));
const SettingsPage = lazy(() => import('../pages/SettingsPage'));
const BookmarksPage = lazy(() => import('../pages/BookmarksPage'));
const ManualTracingPage = lazy(() => import('../pages/ManualTracingPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );
}

function LazyPage({ children }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route
          element={
            <ProtectedRoute roles={['admin']}>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="admin"
            element={
              <LazyPage>
                <AdminPage />
              </LazyPage>
            }
          />
          <Route
            path="admin/topics/:id/edit"
            element={
              <LazyPage>
                <AdminLessonEditorPage />
              </LazyPage>
            }
          />
          <Route
            path="admin/problems/:id/edit"
            element={
              <LazyPage>
                <AdminProblemEditorPage />
              </LazyPage>
            }
          />
          <Route
            path="admin/quizzes/:id/edit"
            element={
              <LazyPage>
                <AdminQuizEditorPage />
              </LazyPage>
            }
          />
          <Route
            path="admin/contests/:id/edit"
            element={
              <LazyPage>
                <AdminContestEditorPage />
              </LazyPage>
            }
          />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route
            path="progress"
            element={
              <LazyPage>
                <ProgressPage />
              </LazyPage>
            }
          />
          <Route
            path="achievements"
            element={
              <LazyPage>
                <AchievementsPage />
              </LazyPage>
            }
          />
          <Route path="learn" element={<LearnPage />} />
          <Route
            path="learn/:slug"
            element={
              <LazyPage>
                <TopicReaderPage />
              </LazyPage>
            }
          />
          <Route
            path="visualizer"
            element={
              <LazyPage>
                <VisualizerPage />
              </LazyPage>
            }
          />
          <Route
            path="visualizer/:algorithmId"
            element={
              <LazyPage>
                <VisualizerWorkspacePage />
              </LazyPage>
            }
          />
          <Route
            path="manual-tracing"
            element={
              <LazyPage>
                <ManualTracingPage />
              </LazyPage>
            }
          />
          <Route path="code-tracing" element={<Navigate to="/manual-tracing" replace />} />
          <Route
            path="playground"
            element={
              <LazyPage>
                <PlaygroundPage />
              </LazyPage>
            }
          />
          <Route
            path="problems"
            element={
              <LazyPage>
                <ProblemsPage />
              </LazyPage>
            }
          />
          <Route
            path="problems/:slug"
            element={
              <LazyPage>
                <ProblemDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="quizzes"
            element={
              <LazyPage>
                <QuizzesPage />
              </LazyPage>
            }
          />
          <Route
            path="quizzes/:id"
            element={
              <LazyPage>
                <QuizTakePage />
              </LazyPage>
            }
          />
          <Route
            path="ai-tutor"
            element={
              <LazyPage>
                <AITutorPage />
              </LazyPage>
            }
          />
          <Route
            path="notes"
            element={
              <LazyPage>
                <NotesPage />
              </LazyPage>
            }
          />
          <Route
            path="notes/:id"
            element={
              <LazyPage>
                <NotesPage />
              </LazyPage>
            }
          />
          <Route
            path="bookmarks"
            element={
              <LazyPage>
                <BookmarksPage />
              </LazyPage>
            }
          />
          <Route
            path="leaderboard"
            element={
              <LazyPage>
                <LeaderboardPage />
              </LazyPage>
            }
          />
          <Route
            path="contests"
            element={
              <LazyPage>
                <ContestsPage />
              </LazyPage>
            }
          />
          <Route
            path="contests/:slug"
            element={
              <LazyPage>
                <ContestDetailPage />
              </LazyPage>
            }
          />
          <Route
            path="contests/:slug/problems/:problemSlug"
            element={
              <LazyPage>
                <ContestProblemPage />
              </LazyPage>
            }
          />
          <Route
            path="settings"
            element={
              <LazyPage>
                <SettingsPage />
              </LazyPage>
            }
          />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
