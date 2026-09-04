import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser, selectIsAuthenticated } from '../../auth/authSlice';
import { setTheme } from '../../theme/themeSlice';

export default function UserPreferencesSync() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!isAuthenticated || !user?.preferences?.theme) return;
    dispatch(setTheme(user.preferences.theme));
  }, [dispatch, isAuthenticated, user?.preferences?.theme]);

  return null;
}
