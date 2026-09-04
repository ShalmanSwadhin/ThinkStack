import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { mobileNavItems } from './navConfig';
import NavIcon from './NavIcon';
import { NAV_ICON_SIZES } from './navConfig';

export default function MobileNav() {
  return (
    <nav
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
      aria-label="Mobile bottom navigation"
    >
      <div className="pointer-events-auto mx-auto max-w-lg rounded-2xl border border-slate-200/80 bg-white/95 shadow-elevated backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-950/95 dark:shadow-elevated-dark">
        <div className="relative flex items-stretch justify-around px-1 py-1">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2',
                  'text-[10px] font-medium transition-all duration-200 ease-smooth',
                  'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                  isActive
                    ? 'font-semibold text-brand-600 dark:text-brand-400'
                    : 'text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="mobile-nav-active"
                      className="absolute inset-x-1 inset-y-1 rounded-xl bg-gradient-to-b from-brand-50 to-brand-100/80 shadow-glow dark:from-brand-950/80 dark:to-brand-900/40 dark:shadow-glow-dark"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-[1] flex min-h-[22px] items-center justify-center">
                    <NavIcon
                      icon={item.icon}
                      size={NAV_ICON_SIZES.mobile}
                      isActive={isActive}
                      className={cn(isActive && 'scale-110')}
                    />
                  </span>
                  <span className="relative z-[1]">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
