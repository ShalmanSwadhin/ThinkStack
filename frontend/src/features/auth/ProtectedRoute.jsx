import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuthInitialized, selectAuthLoading, selectIsAuthenticated } from '../auth/authSlice';
import { startGuestSession } from './authThunks';
import { isAutoGuestSuppressed } from '../../services/guestSession';

function Spinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
    </div>
  );
}

export default function ProtectedRoute({ children, roles }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectAuthLoading);
  const isInitialized = useSelector(selectAuthInitialized);
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const [guestStartFailed, setGuestStartFailed] = useState(false);

  // Visitors without a session continue as a guest instead of being sent to /login.
  // Role-restricted areas (admin) are never open to guests, and an explicit logout must stay
  // logged out rather than instantly becoming a new guest.
  const needsGuestSession =
    isInitialized &&
    !isLoading &&
    !isAuthenticated &&
    !roles?.length &&
    !guestStartFailed &&
    !isAutoGuestSuppressed();

  useEffect(() => {
    if (!needsGuestSession) return;
    dispatch(startGuestSession())
      .unwrap()
      .catch(() => setGuestStartFailed(true));
  }, [needsGuestSession, dispatch]);

  if (!isInitialized || isLoading || needsGuestSession) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
