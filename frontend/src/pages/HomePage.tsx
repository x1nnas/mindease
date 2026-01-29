import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ErrorTestingButton } from '../components/ErrorTesting';
import { SentryDiagnostics } from '../components/SentryDiagnostics';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { LogoutButton } from '../components/LogoutButton';
import { BrandLogo } from '../components/BrandLogo';
import { useLanguage } from '../i18n/useLanguage';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const [isEntering, setIsEntering] = useState(() => 
    !!location.state?.fromMoodCheckIn || !!location.state?.fromJournal
  );

  useEffect(() => {
    // Animate in if coming from other pages
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  // Reset scroll position when navigating to home page
  // This fixes the issue where keyboard pushes content up and it stays hidden
  useEffect(() => {
    // Scroll to top when component mounts or when navigating back
    window.scrollTo(0, 0);
    // Also reset the main content container scroll
    const mainContent = document.querySelector('[data-home-main-content]');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [location.pathname]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('goodMorning');
    if (hour < 18) return t('goodAfternoon');
    return t('goodEvening');
  };

  const handleNavigateToChat = () => {
    navigate('/chat', { state: { fromHome: true } });
  };

  return (
    <div 
      className="relative overflow-hidden bg-[#1a241f]"
      style={{
        height: '100dvh', // Dynamic viewport height for mobile (excludes keyboard), falls back to 100vh
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Glow background layer - matching other pages */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Main green glow - top left */}
        <div
          className="absolute -top-1/4 -left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(100 45% 55% / 0.4) 0%, hsl(95 40% 50% / 0.15) 40%, transparent 70%)",
            filter: "blur(70px)",
          }}
        />
        
        {/* Secondary olive glow - bottom right */}
        <div
          className="absolute -bottom-1/4 -right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(75 35% 45% / 0.35) 0%, hsl(80 30% 40% / 0.12) 40%, transparent 70%)",
            filter: "blur(85px)",
          }}
        />
        
        {/* Subtle center accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(90 35% 50% / 0.12) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* Error Testing Button (Dev Only) */}
      {import.meta.env.DEV && <ErrorTestingButton />}
      {import.meta.env.DEV && <SentryDiagnostics />}

      {/* Main content with bottom padding for nav */}
      <div 
        className="flex-1 flex flex-col px-4 sm:px-6 pt-8 sm:pt-16 pb-28 sm:pb-32 relative z-10 overflow-y-auto" 
        data-home-main-content
        style={{ 
          maxHeight: '100dvh', // Dynamic viewport height (excludes keyboard), falls back to 100vh
          paddingBottom: 'clamp(7rem, 12vh, 8rem)' 
        }}
      >
        {/* Language Switcher & Logout - subtle top right */}
        <div 
          className="absolute top-6 right-6 z-20 flex items-center gap-2"
          style={{ 
            animation: 'fadeUp 0.8s ease-out 0.4s',
            animationFillMode: 'both',
          }}
        >
          <LanguageSwitcher />
          <LogoutButton />
        </div>

        {/* Hero Section */}
        <div
          className={`flex-1 flex flex-col justify-center transition-all duration-1000 ease-out ${
            isEntering 
              ? 'opacity-0' 
              : 'opacity-100'
          }`}
        >
          {/* Ambient hero glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(150 50% 50% / 0.12) 0%, transparent 60%)",
              filter: "blur(40px)",
            }}
          />

          {/* Greeting & Headline */}
          <div
            className="text-center space-y-3 mb-8"
            style={{ 
              animation: 'fadeUp 0.8s ease-out 0.2s',
              animationFillMode: 'both',
            }}
          >
            <p className="text-white/60 text-xs sm:text-sm tracking-wide font-light">
              {getGreeting()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-light text-white/90 leading-relaxed tracking-wide">
              {t('thisMomentYours')}
              <br />
              <span className="text-white/70">{t('howCanIHelp')}</span>
            </h1>
          </div>

          {/* Primary CTA - Talk to Serenity */}
          <div
            className="mb-6"
            style={{ 
              animation: 'fadeUp 0.8s ease-out 0.4s',
              animationFillMode: 'both',
            }}
          >
            <button
              onClick={handleNavigateToChat}
              className="w-full group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(145deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.08) 100%)",
                boxShadow: "0 8px 40px hsl(150 50% 50% / 0.15), inset 0 1px 0 hsl(150 50% 50% / 0.2)",
              }}
            >
              {/* Animated glow overlay */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{
                  background: "radial-gradient(circle at 50% 50%, hsl(150 50% 50% / 0.15) 0%, transparent 60%)",
                }}
              />

              <div className="relative flex flex-col items-center gap-3">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(150 50% 50% / 0.35) 0%, hsl(150 50% 50% / 0.15) 100%)",
                    boxShadow: "0 4px 24px hsl(150 50% 50% / 0.25)",
                  }}
                >
                  <svg 
                    className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" 
                    />
                  </svg>
                </div>
                <div className="text-center">
                  <h2 className="text-lg sm:text-xl font-medium text-white/90 mb-1">
                    {t('talkToSerenity')}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/60">
                    {t('serenityHere')}
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Secondary Actions Row */}
          <div
            className="flex gap-3"
            style={{ 
              animation: 'fadeUp 0.8s ease-out 0.6s',
              animationFillMode: 'both',
            }}
          >
            {/* Mood Check-In */}
            <button
              onClick={() => navigate('/mood-check-in')}
              className="flex-1 group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                boxShadow: "inset 0 1px 0 hsl(150 50% 50% / 0.1)",
              }}
            >
              <div className="relative flex flex-col items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.1) 100%)",
                  }}
                >
                  <svg 
                    className="w-5 h-5 text-white/60" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-white/80">
                  {t('moodCheckIn')}
                </span>
              </div>
            </button>

            {/* Journal */}
            <button
              onClick={() => navigate('/journal', { state: { fromHome: true } })}
              className="flex-1 group relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
                boxShadow: "inset 0 1px 0 hsl(150 50% 50% / 0.1)",
              }}
            >
              <div className="relative flex flex-col items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, hsl(150 50% 50% / 0.2) 0%, hsl(150 50% 50% / 0.1) 100%)",
                  }}
                >
                  <svg 
                    className="w-5 h-5 text-white/60" 
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
                </div>
                <span className="text-sm font-medium text-white/80">
                  {t('journal')}
                </span>
              </div>
            </button>
          </div>

          {/* Watermark Logo with MindEase text */}
          <div
            className="mt-8 mb-8"
            style={{ 
              animation: 'fadeUp 0.8s ease-out 0.8s',
              animationFillMode: 'both',
              marginBottom: 'clamp(2rem, 6vh, 3rem)', // Reduced spacing for better fit
            }}
          >
            <BrandLogo size="sm" showText={true} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

