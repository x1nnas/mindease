import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  isPrimary?: boolean;
}

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [shouldShow, setShouldShow] = useState(false);

  // Pages where navigation should never appear
  const hiddenPages = ['/auth', '/welcome', '/', '/mood-transition', '/mood-skip'];
  
  // Check if current page should hide navigation
  // Special case: mood-check-in only hides nav if coming from welcome page
  const isMoodCheckIn = location.pathname === '/mood-check-in';
  const isFromWelcome = location.state?.fromWelcome || 
                        document.referrer.includes('/welcome') ||
                        sessionStorage.getItem('justCompletedWelcome') === 'true';
  
  const shouldHide = hiddenPages.includes(location.pathname) || 
                     (isMoodCheckIn && isFromWelcome);

  useEffect(() => {
    // Don't show if not authenticated or on hidden pages
    if (!isAuthenticated || shouldHide) {
      setShouldShow(false);
      return;
    }

    // Special handling for mood-check-in page
    if (isMoodCheckIn) {
      // If coming from welcome page, don't show nav (user is doing initial check-in)
      if (isFromWelcome) {
        setShouldShow(false);
        return;
      }
      // Otherwise, user is returning to mood-check-in, show nav immediately
      setShouldShow(true);
      return;
    }

    // If coming from welcome page (but not to mood-check-in), wait for transition to complete
    // WelcomePage shows for 3 seconds, then fades for 0.7s, then navigates
    if (isFromWelcome) {
      // Wait for welcome page transition to complete (3s display + 0.7s fade)
      const timer = setTimeout(() => {
        setShouldShow(true);
        sessionStorage.removeItem('justCompletedWelcome');
      }, 3800); // Slightly after welcome transition completes

      return () => clearTimeout(timer);
    } else {
      // For other pages, show immediately but with animation
      setShouldShow(true);
    }
  }, [isAuthenticated, shouldHide, location.pathname, location.state, isMoodCheckIn, isFromWelcome]);

  // Don't show navigation if not authenticated or on hidden pages
  if (!isAuthenticated || shouldHide || !shouldShow) {
    return null;
  }

  const tabs: Tab[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
          />
        </svg>
      ),
      path: '/home',
    },
    {
      id: 'serenity',
      label: 'Serenity',
      icon: (
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      ),
      path: '/chat',
      isPrimary: true,
    },
    {
      id: 'journal',
      label: 'Journal',
      icon: (
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
          />
        </svg>
      ),
      path: '/journal',
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2 pointer-events-none"
      style={{
        animation: 'slideUp 0.6s ease-out',
        animationFillMode: 'both',
      }}
    >
      <nav
        className="mx-auto max-w-sm rounded-3xl px-2 py-2 pointer-events-auto"
        style={{
          background: "#151D18",
          backdropFilter: "blur(20px)",
          boxShadow: "0 -4px 30px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);

            if (tab.isPrimary) {
              return (
                <button
                  key={tab.id}
                  onClick={() => navigate(tab.path)}
                  className="relative -mt-6 flex flex-col items-center group"
                  style={{
                    animation: `fadeUp 0.5s ease-out ${0.4 + index * 0.1}s`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Elevated primary button */}
                  <div
                    className="relative flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-300 group-active:scale-95 group-hover:scale-105"
                    style={{
                      background: "linear-gradient(135deg, hsl(150 50% 50%) 0%, hsl(150 50% 60%) 100%)",
                      boxShadow: "0 4px 20px hsl(150 50% 50% / 0.4), 0 0 40px hsl(150 50% 50% / 0.2)",
                    }}
                  >
                    {/* Glow ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "radial-gradient(circle, hsl(150 50% 50% / 0.3) 0%, transparent 70%)",
                        transform: "scale(1.3)",
                        animation: 'pulseGlow 2s ease-in-out infinite',
                      }}
                    />
                    <div className="relative z-10 text-white">
                      {tab.icon}
                    </div>
                  </div>
                  <span 
                    className="mt-1.5 text-xs font-medium transition-colors duration-200"
                    style={{
                      color: "hsl(150 50% 50%)",
                    }}
                  >
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center px-4 py-2 group transition-all duration-200 group-active:scale-95"
                style={{
                  animation: `fadeUp 0.5s ease-out ${0.4 + index * 0.1}s`,
                  animationFillMode: 'both',
                }}
              >
                <div
                  className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    background: active 
                      ? "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.15) 100%)"
                      : "transparent",
                  }}
                >
                  <div
                    className={`transition-colors duration-200 ${
                      active ? "text-green-400" : "text-white/50"
                    }`}
                  >
                    {tab.icon}
                  </div>
                </div>
                <span
                  className={`mt-1 text-xs transition-colors duration-200 ${
                    active ? "text-white font-medium" : "text-white/50"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1.3);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.4);
          }
        }
      `}</style>
    </div>
  );
};

export default BottomNavigation;
