import { useState, useEffect, useCallback } from 'react';

export interface RouteState {
  path: string;
  params: Record<string, string>;
}

export function useRouter() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Parse route patterns
  const matchRoute = useCallback((pattern: string): Record<string, string> | null => {
    const patternSegments = pattern.split('/').filter(Boolean);
    const pathSegments = currentPath.split('/').filter(Boolean);

    if (patternSegments.length !== pathSegments.length) {
      return null;
    }

    const params: Record<string, string> = {};
    for (let i = 0; i < patternSegments.length; i++) {
      const pSeg = patternSegments[i];
      const actualSeg = pathSegments[i];

      if (pSeg.startsWith(':')) {
        const paramName = pSeg.slice(1);
        params[paramName] = decodeURIComponent(actualSeg);
      } else if (pSeg !== actualSeg) {
        return null;
      }
    }

    return params;
  }, [currentPath]);

  return {
    path: currentPath,
    navigate,
    matchRoute,
  };
}
