import { useEffect } from 'react';

export function useBeforeUnload(when, message = 'You have unsaved changes.') {
  useEffect(() => {
    if (!when) return undefined;

    const handler = (event) => {
      event.preventDefault();
      event.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [when, message]);
}

export default useBeforeUnload;
