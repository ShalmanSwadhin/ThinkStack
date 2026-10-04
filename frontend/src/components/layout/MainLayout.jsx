import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import GuestBanner from './GuestBanner';
import MobileNav from './MobileNav';
import BadgeToastStack from '../../features/gamification/components/BadgeToastStack';
import UserPreferencesSync from '../../features/settings/components/UserPreferencesSync';
import useSidebarState from './useSidebarState';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip">
      <Navbar />
      <main className="min-w-0 flex-1 overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function AppLayout() {
  const { collapsed, mobileOpen, toggleCollapsed, toggleMobile, closeMobile } = useSidebarState();

  return (
    <div className="flex h-screen min-w-0 flex-col overflow-hidden">
      <Navbar onMenuToggle={toggleMobile} />
      <GuestBanner />
      <div className="flex min-h-0 min-w-0 flex-1">
        <Sidebar
          collapsed={collapsed}
          mobileOpen={mobileOpen}
          onToggleCollapsed={toggleCollapsed}
          onCloseMobile={closeMobile}
        />
        <main id="app-scroll" className="app-shell-bg min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-clip">
          <Outlet />
        </main>
      </div>
      <MobileNav />
      <UserPreferencesSync />
      <BadgeToastStack />
    </div>
  );
}
