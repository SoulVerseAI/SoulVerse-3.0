import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Consistent with the media query in index.html

/**
 * A custom hook that returns `true` if the window width is less than the mobile breakpoint.
 * This is a dynamic check that responds to window resizing, unlike a static user-agent check.
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};
