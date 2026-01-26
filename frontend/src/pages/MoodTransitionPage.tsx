import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';

interface MoodData {
  label: string;
  emoji: string;
  affirmation: string;
  hue: number;
  saturation: number;
  lightness: number;
}

// Map mood values to mood data
// Based on the moodLabels from MoodCheckInPage
const getMoodData = (value: number, t: (key: keyof typeof import('../i18n/lang').copy.en) => string): MoodData => {
  if (value <= 12) {
    return {
      label: t('moodVeryBad'),
      emoji: "😔",
      affirmation: t('affirmationVeryBad'),
      hue: 200,
      saturation: 20,
      lightness: 35,
    };
  }
  if (value <= 37) {
    return {
      label: t('moodBad'),
      emoji: "😕",
      affirmation: t('affirmationBad'),
      hue: 180,
      saturation: 25,
      lightness: 40,
    };
  }
  if (value <= 62) {
    return {
      label: t('moodCalm'),
      emoji: "😌",
      affirmation: t('affirmationCalm'),
      hue: 150,
      saturation: 35,
      lightness: 45,
    };
  }
  if (value <= 87) {
    return {
      label: t('moodAllGood'),
      emoji: "😊",
      affirmation: t('affirmationAllGood'),
      hue: 85,
      saturation: 50,
      lightness: 55,
    };
  }
  return {
    label: t('moodAmazing'),
    emoji: "✨",
    affirmation: t('affirmationAmazing'),
    hue: 75,
    saturation: 55,
    lightness: 60,
  };
};

export default function MoodTransitionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Get mood value from navigation state, default to calm (50)
  const moodValue = (location.state as { moodValue?: number })?.moodValue ?? 50;
  const mood = getMoodData(moodValue, t);

  const glowColor = `hsl(${mood.hue}, ${mood.saturation}%, ${mood.lightness}%)`;
  const glowColorMuted = `hsl(${mood.hue}, ${mood.saturation - 10}%, ${mood.lightness - 15}%)`;

  useEffect(() => {
    // Navigate to home after 2.8 seconds (matching the provided code)
    const timer = setTimeout(() => {
      navigate('/home', { state: { fromMoodCheckIn: true } });
    }, 2800);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative h-screen flex flex-col bg-[#1a241f] overflow-hidden">
      {/* Mood-colored ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: `radial-gradient(circle, ${glowColor}25 0%, ${glowColorMuted}10 40%, transparent 70%)`,
            filter: "blur(60px)",
            animation: 'pulseGlow 4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Content */}
      <main className="relative z-10 flex flex-col flex-1 items-center justify-center px-8">
        {/* Emoji with gentle pulse */}
        <div
          className="mb-6"
          style={{
            animation: 'fadeInScale 0.8s ease-out',
            animationFillMode: 'both',
          }}
        >
          <span
            className="text-6xl sm:text-7xl block"
            style={{
              animation: 'gentlePulse 3s ease-in-out infinite',
            }}
          >
            {mood.emoji}
          </span>
        </div>

        {/* Mood label */}
        <p
          className="text-lg sm:text-xl font-light tracking-wide mb-4"
          style={{
            color: glowColor,
            animation: 'fadeUp 0.8s ease-out 0.3s',
            animationFillMode: 'both',
          }}
        >
          {mood.label}
        </p>

        {/* Affirmation */}
        <p
          className="text-base sm:text-lg text-white/70 font-light text-center max-w-xs leading-relaxed"
          style={{
            animation: 'fadeUp 0.8s ease-out 0.6s',
            animationFillMode: 'both',
          }}
        >
          {mood.affirmation}
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
              className="h-full rounded-full"
              style={{
                backgroundColor: glowColor,
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

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.8;
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
