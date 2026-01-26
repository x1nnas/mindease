import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * Checks both window width and user agent
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    
    // Check window width
    const isSmallScreen = window.innerWidth < 768;
    
    // Check user agent for mobile devices
    const userAgent = window.navigator.userAgent || '';
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return isSmallScreen || isMobileUserAgent;
  });

  useEffect(() => {
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      const userAgent = window.navigator.userAgent || '';
      const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobile(isSmallScreen || isMobileUserAgent);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
}
