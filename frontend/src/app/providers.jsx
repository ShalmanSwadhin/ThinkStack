import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './router';
import AuthInitializer from '../features/auth/AuthInitializer';

export default function AppProviders() {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <AppRouter />
      </AuthInitializer>
    </Provider>
  );
}
