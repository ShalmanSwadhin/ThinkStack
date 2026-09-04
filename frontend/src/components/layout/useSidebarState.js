import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'thinkstack:sidebar-collapsed';

export function useSidebarState() {
  const [collapsed, setCollapsedState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((current) => !current);
  }, []);

  const toggleMobile = useCallback(() => {
    setMobileOpen((current) => !current);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return {
    collapsed,
    mobileOpen,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
    setCollapsed: setCollapsedState,
  };
}

export default useSidebarState;
