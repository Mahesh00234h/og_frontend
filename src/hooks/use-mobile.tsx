import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // Initialize with a default value to avoid `undefined` in SSR or initial render
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Guard against non-browser environments (e.g., SSR)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Set initial value based on media query
    setIsMobile(mql.matches);

    const onChange = () => {
      setIsMobile(mql.matches); // Use mql.matches instead of window.innerWidth
    };

    // Add event listener (modern browsers use addEventListener)
    mql.addEventListener('change', onChange);

    // Cleanup
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []); // Empty dependency array ensures effect runs only once

  return isMobile; // No need for !! since isMobile is always boolean
}
