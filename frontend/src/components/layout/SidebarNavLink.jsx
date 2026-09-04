import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import NavIcon from './NavIcon';
import NavTooltip from './NavTooltip';
import { NAV_ICON_SIZES } from './navConfig';

export default function SidebarNavLink({ to, label, icon, collapsed, onNavigate, layoutId = 'sidebar-active' }) {
  return (
    <NavTooltip label={label} show={collapsed}>
      <NavLink
        to={to}
        onClick={onNavigate}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) =>
          cn(
            'sidebar-link group/nav relative',
            collapsed && 'justify-center px-2',
            isActive && 'sidebar-link-active font-semibold'
          )
        }
      >
        {({ isActive }) => (
          <>
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="sidebar-active-pill"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <NavIcon icon={icon} size={NAV_ICON_SIZES.sidebar} isActive={isActive} />
            {!collapsed && <span className="relative z-[1] truncate">{label}</span>}
          </>
        )}
      </NavLink>
    </NavTooltip>
  );
}
