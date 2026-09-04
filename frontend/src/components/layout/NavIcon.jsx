import { memo } from 'react';
import { cn } from '../../utils/cn';

const NavIcon = memo(function NavIcon({ icon: Icon, size = 22, className, isActive }) {
  if (!Icon) return null;

  return (
    <Icon
      size={size}
      strokeWidth={2}
      aria-hidden="true"
      className={cn(
        'shrink-0 transition-all duration-200 ease-smooth',
        isActive && 'scale-110',
        className
      )}
    />
  );
});

export default NavIcon;
