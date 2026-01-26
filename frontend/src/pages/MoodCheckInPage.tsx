import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { saveOrUpdateMoodCheckIn, hasCheckedInToday as checkHasCheckedInToday } from "../utils/moodUtils";
import { useLanguage } from "../i18n/useLanguage";

const moodLabels = [
  { value: 0, label: "Very Bad 😔", hue: 200, saturation: 20, lightness: 35 },
  { value: 25, label: "Bad 😕", hue: 180, saturation: 25, lightness: 40 },
  { value: 50, label: "Calm 😌", hue: 150, saturation: 35, lightness: 45 },
  { value: 75, label: "All Good 😊", hue: 85, saturation: 50, lightness: 55 },
  { value: 100, label: "Feeling Amazing! ✨", hue: 75, saturation: 55, lightness: 60 },
];

const getMoodData = (value: number) => {
  // Find the two closest mood points and interpolate
  const lower = moodLabels.reduce((prev, curr) => 
    curr.value <= value && curr.value > prev.value ? curr : prev
  , moodLabels[0]);
  
  const upper = moodLabels.reduce((prev, curr) => 
    curr.value >= value && curr.value < prev.value ? curr : prev
  , moodLabels[moodLabels.length - 1]);

  if (lower.value === upper.value) {
    return lower;
  }

  const ratio = (value - lower.value) / (upper.value - lower.value);
  
  return {
    value,
    label: ratio < 0.5 ? lower.label : upper.label,
    hue: lower.hue + (upper.hue - lower.hue) * ratio,
    saturation: lower.saturation + (upper.saturation - lower.saturation) * ratio,
    lightness: lower.lightness + (upper.lightness - lower.lightness) * ratio,
  };
};

const MoodCheckIn = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [moodValue, setMoodValue] = useState([50]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingMood, setIsCheckingMood] = useState(true); // Loading state for initial mood check
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false); // Track if user already checked in
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Confirmation dialog state
  const [hasSelectedMood, setHasSelectedMood] = useState(false); // Track if user has moved the slider
  const mood = getMoodData(moodValue[0]);

  // Check if user has already checked in today when component loads
  // This can be used to show a message or pre-fill the slider
  useEffect(() => {
    const checkToday = async () => {
      setIsCheckingMood(true);
      try {
        const checkedIn = await checkHasCheckedInToday();
        setHasCheckedInToday(checkedIn);
        // TODO: Could pre-fill slider with today's mood value if checkedIn
      } catch (error) {
        // Silently fail - this is just a check, not critical
        console.error('Error checking today mood:', error);
      } finally {
        setIsCheckingMood(false);
      }
    };
    checkToday();
  }, []);

  // Track if user has moved the slider from default
  useEffect(() => {
    if (moodValue[0] !== 50) {
      setHasSelectedMood(true);
    }
  }, [moodValue]);

  const glowColor = `hsl(${mood.hue}, ${mood.saturation}%, ${mood.lightness}%)`;
  const glowColorMuted = `hsl(${mood.hue}, ${mood.saturation - 10}%, ${mood.lightness - 15}%)`;

  const saveMood = async () => {
    setIsLoading(true);
    try {
      // Save or update mood check-in for today via API
      // Backend handles:
      // - Normalizing date to start-of-day UTC
      // - Enforcing one mood per user per day (compound unique index)
      // - Creating or updating as needed
      await saveOrUpdateMoodCheckIn({
        value: moodValue[0],
        label: mood.label,
      });
      
      // Navigate to mood transition page with mood value
      navigate('/mood-transition', { state: { moodValue: moodValue[0] } });
    } catch (error) {
      console.error('Error saving mood check-in:', error);
      // Still navigate even if save fails (graceful degradation)
      navigate('/mood-transition', { state: { moodValue: moodValue[0] } });
    } finally {
      setIsLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const handleContinue = async () => {
    // If user has already checked in today, show confirmation dialog
    if (hasCheckedInToday && !showConfirmDialog) {
      setShowConfirmDialog(true);
      return;
    }

    // Otherwise, save directly
    await saveMood();
  };

  const handleConfirmUpdate = () => {
    setShowConfirmDialog(false);
    saveMood();
  };

  const handleCancelUpdate = () => {
    setShowConfirmDialog(false);
  };

  const handleSkip = () => {
    // No data saved, navigate to mood skip page
    navigate('/mood-skip');
  };

  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Smooth entrance animation when coming from welcome page
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      setTimeout(() => {
        setIsEntering(false);
      }, 50);
    });
  }, []);

  return (
    <div className="relative h-screen flex flex-col bg-[#1a241f] overflow-hidden">
      {/* Base ambient background - matching EntryPage/AuthPage style - always visible */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none bg-[#1a241f]">
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

      {/* Content with smooth fade-in */}
      <main className={`relative z-10 flex flex-col flex-1 items-center justify-between px-4 sm:px-6 py-6 sm:py-12 pb-20 sm:pb-28 transition-opacity duration-700 ease-out overflow-y-auto ${
        isEntering ? 'opacity-0' : 'opacity-100'
      }`}>
        {/* Loading overlay for initial mood check */}
        {isCheckingMood && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a241f]/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-green-400/60"
                    style={{
                      animation: `loadingDot 1.2s ease-in-out infinite`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-white/60 text-sm font-light tracking-wide">{t('pleaseWait')}</p>
            </div>
          </div>
        )}
        
        {/* Title */}
        <div
          className="text-center mt-4 animate-fade-up"
          style={{ 
            animation: 'fadeUp 0.8s ease-out',
            animationFillMode: 'both',
          }}
        >
          <h1 className="text-xl sm:text-2xl font-light text-white/90 tracking-wide leading-relaxed whitespace-pre-line">
            {t('chooseFeeling')}
          </h1>
        </div>

        {/* Central Mood Orb */}
        <div
          className="relative flex items-center justify-center my-8 animate-scale-in"
          style={{ 
            animation: 'scaleIn 1s ease-out 0.2s',
            animationFillMode: 'both',
          }}
        >
          {/* Outer glow layers */}
          <div
            className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full animate-pulse-glow"
            style={{
              background: `radial-gradient(circle, ${glowColorMuted}20 0%, transparent 70%)`,
              filter: "blur(40px)",
              animation: 'pulseGlow 4s ease-in-out infinite',
            }}
          />
          
          {/* Middle glow layer */}
          <div
            className="absolute w-48 h-48 sm:w-60 sm:h-60 rounded-full animate-pulse-glow-delayed"
            style={{
              background: `radial-gradient(circle, ${glowColor}30 0%, ${glowColorMuted}10 50%, transparent 70%)`,
              filter: "blur(25px)",
              animation: 'pulseGlow 3s ease-in-out infinite 0.5s',
            }}
          />

          {/* Inner organic shape - softer, more organic edges */}
          <div
            className="relative w-36 h-36 sm:w-44 sm:h-44 animate-rotate-slow"
            style={{
              animation: 'rotateSlow 12s ease-in-out infinite',
            }}
          >
            {/* Multiple layered shapes for organic effect */}
            <div
              className="absolute inset-0 rounded-[40%_60%_55%_45%/55%_45%_60%_40%] animate-border-morph-1"
              style={{
                background: `radial-gradient(ellipse at 30% 30%, ${glowColor}60 0%, ${glowColorMuted}40 50%, transparent 70%)`,
                filter: "blur(8px)",
                animation: 'borderMorph1 8s ease-in-out infinite',
              }}
            />
            
            <div
              className="absolute inset-2 rounded-[45%_55%_50%_50%/50%_50%_55%_45%] animate-border-morph-2"
              style={{
                background: `radial-gradient(ellipse at 40% 40%, ${glowColor}80 0%, ${glowColorMuted}50 60%, transparent 80%)`,
                filter: "blur(4px)",
                animation: 'borderMorph2 6s ease-in-out infinite 1s',
              }}
            />

            {/* Core bright center */}
            <div
              className="absolute inset-6 rounded-[50%_50%_45%_55%/55%_45%_50%_50%] animate-border-morph-3"
              style={{
                background: `radial-gradient(circle at 45% 45%, hsl(${mood.hue}, ${mood.saturation + 10}%, ${mood.lightness + 15}%) 0%, ${glowColor} 50%, ${glowColorMuted} 100%)`,
                animation: 'borderMorph3 5s ease-in-out infinite 0.5s',
              }}
            />
          </div>
        </div>

        {/* Mood Label */}
        <div
          key={mood.label}
          className="text-center mb-8 animate-fade-in"
          style={{ 
            animation: 'fadeIn 0.3s ease-out',
            animationFillMode: 'both',
          }}
        >
          <p 
            className="text-2xl sm:text-3xl font-light tracking-wide"
            style={{ color: glowColor }}
          >
            {mood.label}
          </p>
        </div>

        {/* Slider and Controls */}
        <div
          className="w-full max-w-sm space-y-8 animate-slide-up"
          style={{ 
            animation: 'slideUp 0.8s ease-out 0.4s',
            animationFillMode: 'both',
          }}
        >
          {/* Custom styled slider */}
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={moodValue[0]}
              onChange={(e) => setMoodValue([parseInt(e.target.value)])}
              className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${glowColor} 0%, ${glowColor} ${moodValue[0]}%, rgba(255,255,255,0.1) ${moodValue[0]}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            
            {/* Scale labels */}
            <div className="flex justify-between text-xs text-white/60 uppercase tracking-wider font-light">
              <span>I'm Not Okay</span>
              <span>Feeling Great</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleContinue}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('pleaseWait') : t('continue')}
            </button>
            
            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full py-3 text-sm text-white/60 hover:text-white/80 transition-colors duration-300 font-light tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {hasCheckedInToday || hasSelectedMood ? t('returnHome') : t('skipForNow')}
            </button>
          </div>
        </div>
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-6">
          <div 
            className="max-w-sm w-full rounded-2xl p-6 space-y-4"
            style={{
              background: "linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            }}
          >
            <h3 className="text-lg font-medium text-white/90">
              {t('updateMood')}
            </h3>
            <p className="text-sm text-white/70 font-light leading-relaxed">
              {t('alreadyCheckedIn')}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCancelUpdate}
                className="flex-1 px-4 py-2.5 text-sm text-white/70 hover:text-white/90 transition-colors duration-200 font-light rounded-lg"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmUpdate}
                className="flex-1 px-4 py-2.5 text-sm text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: "linear-gradient(135deg, hsl(150 50% 50%) 0%, hsl(150 50% 60%) 100%)",
                  boxShadow: "0 2px 12px hsl(150 50% 50% / 0.3)",
                }}
              >
                {t('yesUpdate')}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes rotateSlow {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(5deg);
          }
          75% {
            transform: rotate(-5deg);
          }
        }
        
        @keyframes borderMorph1 {
          0%, 100% {
            border-radius: 40% 60% 55% 45% / 55% 45% 60% 40%;
          }
          50% {
            border-radius: 55% 45% 40% 60% / 45% 55% 45% 55%;
          }
        }
        
        @keyframes borderMorph2 {
          0%, 100% {
            border-radius: 45% 55% 50% 50% / 50% 50% 55% 45%;
          }
          50% {
            border-radius: 50% 50% 55% 45% / 55% 45% 50% 50%;
          }
        }
        
        @keyframes borderMorph3 {
          0%, 100% {
            border-radius: 50% 50% 45% 55% / 55% 45% 50% 50%;
          }
          50% {
            border-radius: 55% 45% 50% 50% / 50% 50% 45% 55%;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0.5;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes loadingDot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${glowColor};
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 10px ${glowColor}40;
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: ${glowColor};
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 0 10px ${glowColor}40;
        }
      `}</style>
    </div>
  );
};

export default MoodCheckIn;
