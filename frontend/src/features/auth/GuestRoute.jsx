import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthInitialized, selectAuthLoading, selectIsAuthenticated } from './authSlice';

export default function GuestRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const isInitialized = useSelector(selectAuthInitialized);

  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
