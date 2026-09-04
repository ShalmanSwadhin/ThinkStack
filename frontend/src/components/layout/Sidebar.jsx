import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { selectIsAdmin } from '../../features/auth/authSlice';
import { cn } from '../../utils/cn';
import { navGroups, adminNavItem } from './navConfig';
import SidebarNavLink from './SidebarNavLink';
import { NAV_ICON_SIZES } from './navConfig';

function SidebarToggle({ collapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 ease-smooth',
        'hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
        collapsed && 'mx-auto'
      )}
      aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      {collapsed ? (
        <ChevronRight size={NAV_ICON_SIZES.small} strokeWidth={2} aria-hidden="true" />
      ) : (
        <ChevronLeft size={NAV_ICON_SIZES.small} strokeWidth={2} aria-hidden="true" />
      )}
    </button>
  );
}

function NavGroups({ collapsed, onNavigate, layoutId }) {
  const isAdmin = useSelector(selectIsAdmin);

  return (
    <>
      {navGroups.map((group, groupIndex) => (
        <div key={group.id} className={cn(groupIndex > 0 && 'mt-4')}>
          {group.label && !collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.label}
            </p>
          )}
          {group.label && collapsed && <div className="mx-auto mb-1.5 h-px w-8 bg-slate-200 dark:bg-slate-700" />}
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <SidebarNavLink
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                onNavigate={onNavigate}
                layoutId={layoutId}
              />
            ))}
          </div>
        </div>
      ))}

      {isAdmin && (
        <div className="mt-4">
          {!collapsed && (
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              ADMIN
            </p>
          )}
          {collapsed && <div className="mx-auto mb-1.5 h-px w-8 bg-slate-200 dark:bg-slate-700" />}
          <SidebarNavLink
            to={adminNavItem.to}
            label={adminNavItem.label}
            icon={adminNavItem.icon}
            collapsed={collapsed}
            onNavigate={onNavigate}
            layoutId={layoutId}
          />
        </div>
      )}
    </>
  );
}

export default function Sidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        className="hidden h-full shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white shadow-soft dark:border-slate-800/80 dark:bg-slate-950 lg:flex"
      >
        <div
          className={cn(
            'flex shrink-0 items-center border-b border-slate-200/80 px-2 py-3 dark:border-slate-800/80',
            collapsed ? 'justify-center' : 'justify-between gap-2'
          )}
        >
          {!collapsed && (
            <span className="truncate px-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              Navigation
            </span>
          )}
          <SidebarToggle collapsed={collapsed} onToggle={onToggleCollapsed} />
        </div>

        <nav
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2.5"
          aria-label="Main navigation"
        >
          <NavGroups collapsed={collapsed} layoutId="sidebar-active-desktop" />
        </nav>
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[2px] lg:hidden"
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] w-72 flex-col border-r border-slate-200/80 bg-white shadow-soft-xl dark:border-slate-800/80 dark:bg-slate-950 lg:hidden"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-4 py-3.5 dark:border-slate-800/80">
                <p className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white">Navigation</p>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 ease-smooth hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                  aria-label="Close navigation menu"
                >
                  <X size={NAV_ICON_SIZES.action} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
              <nav
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
                aria-label="Mobile navigation"
              >
                <NavGroups collapsed={false} onNavigate={onCloseMobile} layoutId="sidebar-active-mobile" />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
