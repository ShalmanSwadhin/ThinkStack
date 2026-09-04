import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import { setTheme, selectTheme } from '../../features/theme/themeSlice';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  updateUser,
} from '../../features/auth/authSlice';
import { logoutUser } from '../../features/auth/authThunks';
import settingsApi from '../../features/settings/settingsService';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import NotificationBell from '../../features/notifications/components/NotificationBell';
import GlobalSearchBar from '../../features/search/components/GlobalSearchBar';
import { NAV_ICON_SIZES } from './navConfig';

function NavbarLink({ to, children, className }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'nav-link relative rounded-lg px-2 py-1 transition-all duration-200 ease-smooth',
          isActive && 'font-semibold text-brand-600 dark:text-brand-400',
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />
          )}
          <span className="relative">{children}</span>
        </>
      )}
    </NavLink>
  );
}

export default function Navbar({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const scrollEl = document.getElementById('app-scroll');
    const target = scrollEl || window;

    const handleScroll = () => {
      const el = document.getElementById('app-scroll');
      const y = el ? el.scrollTop : window.scrollY;
      setScrolled(y > 8);
    };

    handleScroll();
    target.addEventListener('scroll', handleScroll, { passive: true });
    return () => target.removeEventListener('scroll', handleScroll);
  }, []);

  const handleThemeToggle = async () => {
    const resolved =
      theme === 'system' && typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;
    const next = resolved === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(next));

    if (isAuthenticated) {
      try {
        await settingsApi.updatePreferences({ theme: next });
        dispatch(
          updateUser({
            preferences: { ...user?.preferences, theme: next },
          })
        );
      } catch {
        // Theme still applied locally
      }
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-200 ease-smooth',
        isLanding
          ? cn('glass shadow-soft', scrolled && 'shadow-soft-md backdrop-blur-md')
          : cn(
              'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-950',
              scrolled && 'border-slate-200/60 bg-white/90 shadow-soft-md backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/90'
            )
      )}
    >
      <nav className="page-container flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-4" aria-label="Top navigation">
        <Link
          to="/"
          className="group flex min-w-0 shrink-0 items-center gap-3 transition-opacity duration-200 hover:opacity-90"
        >
          <div className="logo-mark h-9 w-9 text-sm transition-transform duration-200 group-hover:scale-105">
            TS
          </div>
          <span className="hidden text-lg font-bold tracking-tight text-slate-900 sm:inline dark:text-white">
            Think<span className="text-brand-600 dark:text-brand-400">Stack</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {!isAuthenticated && (
            <Link to="/#features" className="nav-link rounded-lg px-2 py-1 transition-all duration-200 ease-smooth">
              Features
            </Link>
          )}
          {isAuthenticated && (
            <>
              <NavbarLink to="/dashboard">Dashboard</NavbarLink>
              <NavbarLink to="/learn">Learn</NavbarLink>
              {isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      'badge-brand rounded-xl px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-smooth',
                      'hover:bg-brand-200 dark:hover:bg-brand-900',
                      isActive && 'ring-2 ring-brand-400/40 dark:ring-brand-600/40'
                    )
                  }
                >
                  Admin
                </NavLink>
              )}
            </>
          )}
        </div>

        {isAuthenticated ? (
          <div className="hidden min-w-0 flex-1 md:block md:max-w-md lg:max-w-lg">
            <GlobalSearchBar />
          </div>
        ) : null}

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {isAuthenticated && onMenuToggle ? (
            <button
              type="button"
              onClick={onMenuToggle}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 ease-smooth hover:bg-slate-100 hover:text-slate-800 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Open navigation menu"
            >
              <Menu size={NAV_ICON_SIZES.navbar} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}

          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 ease-smooth hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun size={NAV_ICON_SIZES.navbar} strokeWidth={2} aria-hidden="true" />
            ) : (
              <Moon size={NAV_ICON_SIZES.navbar} strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          {isAuthenticated ? <NotificationBell /> : null}

          {isAuthenticated ? (
            <>
              <div className="hidden min-w-0 items-center gap-2.5 md:flex">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-100 to-brand-200 text-sm font-semibold text-brand-700 ring-2 ring-white transition-transform duration-200 hover:scale-105 dark:from-brand-900 dark:to-brand-950 dark:text-brand-300 dark:ring-slate-800">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[8rem] truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.username}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 px-2 sm:px-3">
                <span className="hidden sm:inline">Log out</span>
                <LogOut size={NAV_ICON_SIZES.action} strokeWidth={2} className="sm:hidden" aria-hidden="true" />
                <span className="sr-only sm:hidden">Log out</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="px-2 sm:px-3">
                  Log in
                </Button>
              </Link>
              <Link to="/register" className="hidden sm:inline-flex">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
