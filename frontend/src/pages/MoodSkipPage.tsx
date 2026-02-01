import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';

export default function MoodSkipPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Navigate to home after 2.8 seconds (matching MoodTransitionPage timing)
    const timer = setTimeout(() => {
      navigate('/home', { state: { fromMoodCheckIn: true } });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative h-screen flex flex-col bg-[#1a241f] overflow-hidden">
      {/* Ambient glow - matching app design */}
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

      {/* Content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center px-8">
        {/* Icon with gentle pulse */}
        <div
          className="mb-6"
          style={{
            animation: 'fadeInScale 0.8s ease-out',
            animationFillMode: 'both',
          }}
        >
          <div
            className="text-6xl sm:text-7xl"
            style={{
              animation: 'gentlePulse 3s ease-in-out infinite',
            }}
          >
            💭
          </div>
        </div>

        {/* Main message */}
        <p
          className="text-base sm:text-lg text-white/70 font-light text-center max-w-xs leading-relaxed"
          style={{
            animation: 'fadeUp 0.8s ease-out 0.3s',
            animationFillMode: 'both',
          }}
        >
          {t('takeMomentThink')}
        </p>

        {/* Secondary message */}
        <p
          className="mt-4 text-sm sm:text-base text-white/60 font-light text-center max-w-xs leading-relaxed"
          style={{
            animation: 'fadeUp 0.8s ease-out 0.6s',
            animationFillMode: 'both',
          }}
        >
          {t('canAlwaysComeBack')}
        </p>

        {/* Subtle progress indicator */}
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
          style={{
            animation: 'fadeIn 0.5s ease-out 1s',
            animationFillMode: 'both',
          }}
        >
          <div className="w-12 h-0.5 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full bg-green-400/60"
              style={{
                animation: 'progressBar 2.5s ease-in-out 0.3s',
                animationFillMode: 'both',
              }}
            />
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes gentlePulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes progressBar {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
