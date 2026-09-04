import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { refreshSession } from './authThunks';
import { setInitialized, setCredentials } from './authSlice';
import {
  setOnSessionRefreshed,
  consumeExplicitLogout,
  hasPersistedSessionHint,
  clearPersistedSession,
} from '../../services/api';

let authBootstrapPromise = null;

export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    setOnSessionRefreshed(({ accessToken, user }) => {
      dispatch(setCredentials({ accessToken, user }));
    });

    if (!authBootstrapPromise) {
      authBootstrapPromise = (async () => {
        try {
          if (!consumeExplicitLogout() && hasPersistedSessionHint()) {
            await dispatch(refreshSession()).unwrap();
          } else if (!hasPersistedSessionHint()) {
            clearPersistedSession();
          }
        } catch {
          clearPersistedSession();
        } finally {
          dispatch(setInitialized());
        }
      })();
    } else {
      authBootstrapPromise.then(() => dispatch(setInitialized()));
    }
  }, [dispatch]);

  return children;
}
