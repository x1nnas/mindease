import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { hasCheckedInToday } from '../utils/moodUtils';
import { BrandLogo } from '../components/BrandLogo';
import { useLanguage } from '../i18n/useLanguage';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mark that we're completing welcome page (for BottomNavigation timing)
    sessionStorage.setItem('justCompletedWelcome', 'true');
    
    let navigationTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    
    // Check if user has already checked in today (based on local timezone)
    const checkMoodStatus = async () => {
      try {
        const hasCheckedIn = await hasCheckedInToday();
        
        // Wait for welcome animation, then navigate
        navigationTimer = setTimeout(() => {
          setIsVisible(false);
          fadeTimer = setTimeout(() => {
            // Only navigate to mood check-in if user hasn't checked in today
            if (!hasCheckedIn) {
              navigate('/mood-check-in', { state: { fromWelcome: true } });
            } else {
              // User already checked in today, go straight to home
              navigate('/home', { state: { fromWelcome: true } });
            }
          }, 700); // Navigate after fade completes (matching transition duration)
        }, 3000);
      } catch (error) {
        console.error('Error checking mood status:', error);
        // On error, default to showing mood check-in
        navigationTimer = setTimeout(() => {
          setIsVisible(false);
          fadeTimer = setTimeout(() => {
            navigate('/mood-check-in', { state: { fromWelcome: true } });
          }, 700);
        }, 3000);
      }
    };
    
    checkMoodStatus();
    
    // Cleanup function
    return () => {
      if (navigationTimer) clearTimeout(navigationTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [navigate]);

  // Get firstName from user object or localStorage
  const getFirstName = () => {
    if (user?.firstName) {
      return user.firstName;
    }
    // Check localStorage for firstName
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.firstName) {
          return parsed.firstName;
        }
      } catch {
        // If parsing fails, try separate key
        const firstName = localStorage.getItem('userFirstName');
        if (firstName) {
          return firstName;
        }
      }
    } else {
      const firstName = localStorage.getItem('userFirstName');
      if (firstName) {
        return firstName;
      }
    }
    return null;
  };

  const firstName = getFirstName();

  return (
    <div className="relative h-screen overflow-hidden bg-[#1a241f]">
      {/* Glow background layer - matching EntryPage and AuthPage */}
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

      {/* Content layer - matching EntryPage mobile sizing */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 sm:px-6 py-6 sm:py-12">
        <main className={`flex flex-col items-center justify-center px-8 text-center transition-all duration-700 ease-out ${
          isVisible 
            ? 'opacity-100 transform translate-y-0 scale-100' 
            : 'opacity-0 transform translate-y-[-20px] scale-95'
        }`}>
          {/* Logo with user's name */}
          <div
            style={{ 
              animation: 'fadeUp 0.8s ease-out',
              animationFillMode: 'both',
            }}
          >
            <BrandLogo size="md" showText={true} customText={firstName || undefined} />
          </div>
          
          {/* Subtle secondary line */}
          <p 
            className="mt-8 text-base sm:text-lg text-white/60 font-light tracking-wide"
            style={{ 
              animation: 'fadeUp 1.4s ease-out 0.5s',
              animationFillMode: 'both',
            }}
          >
            {t('takeMoment')}
          </p>
          
          {/* Gentle decorative line */}
          <div 
            className="mt-8 w-12 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"
            style={{ 
              animation: 'fadeUp 1.6s ease-out 0.9s',
              animationFillMode: 'both',
            }}
          />
        </main>
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
