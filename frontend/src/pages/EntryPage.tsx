import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useIsMobile } from '../utils/useIsMobile';
import { BrandLogo } from '../components/BrandLogo';
import { SmartphoneIcon } from '../components/icons/SmartphoneIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { useLanguage } from '../i18n/useLanguage';

// QR Code component - install qrcode.react package for this to work
// Run: npm install qrcode.react
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - qrcode.react may not be installed
import { QRCodeSVG } from 'qrcode.react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function EntryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  
  // Get the current URL for QR code
  const appUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  // Testing bypass: Allow desktop access with ?desktop=true query parameter
  const allowDesktop = searchParams.get('desktop') === 'true' || import.meta.env.DEV;

  // Detect browser and OS for platform-specific instructions
  const getInstallInstructions = () => {
    if (typeof window === 'undefined') return null;
    
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isBrave = (navigator as { brave?: { isBrave: boolean } }).brave?.isBrave || false;
    const isChrome = /chrome/.test(userAgent) && !/edge|opr|brave/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    
    if (isIOS) {
      return {
        steps: [
          t('iosStep1'),
          t('iosStep2'),
          t('iosStep3'),
        ],
        icon: '📱'
      };
    } else if (isAndroid) {
      if (isBrave || isChrome) {
        return {
          steps: [
            t('androidBraveStep1'),
            t('androidBraveStep2'),
            t('androidBraveStep3'),
          ],
          icon: '📲'
        };
      } else if (isFirefox) {
        return {
          steps: [
            t('androidFirefoxStep1'),
            t('androidFirefoxStep2'),
            t('androidFirefoxStep3'),
          ],
          icon: '📲'
        };
      }
    }
    
    // Generic fallback
    return {
      steps: [
        t('genericStep1'),
        t('genericStep2'),
        t('genericStep3'),
      ],
      icon: '📱'
    };
  };

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If beforeinstallprompt hasn't fired (iOS Safari, Brave, or not supported)
      // Show inline instructions instead of alert
      setShowInstallInstructions(true);
      return;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user's choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
        setShowInstallInstructions(false);
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      // Fallback: show inline instructions
      setShowInstallInstructions(true);
    }
  };

  const handleContinueInBrowser = () => {
    navigate('/auth', { replace: true, state: { fromEntry: true } });
  };

  // Desktop View - GATE: Blocks desktop users, shows QR code to scan on mobile
  // No navigation options - desktop users must scan QR code to access on mobile
  // Exception: Allow desktop access in dev mode or with ?desktop=true for testing
  if (!isMobile) {
    // Desktop bypass for testing
    if (allowDesktop) {
      return (
        <div className="relative h-screen flex flex-col items-center justify-center bg-[#1a241f] overflow-hidden px-4 sm:px-6">
          {/* Glow background */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
              style={{
                background: "radial-gradient(circle, hsl(150 50% 50% / 0.12) 0%, transparent 60%)",
                filter: "blur(60px)",
              }}
            />
          </div>
          
          <main className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-sm">
            {/* Dev mode notice */}
            {import.meta.env.DEV && (
              <div className="mb-4 px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <p className="text-xs text-yellow-400 font-medium">DEV MODE: Desktop access enabled</p>
              </div>
            )}
            
            {/* Logo */}
            <div
              className="mb-6"
              style={{ 
                animation: 'fadeInScale 0.8s ease-out',
                animationFillMode: 'both',
              }}
            >
              <BrandLogo size="md" showText={false} />
            </div>
            
            {/* Wordmark */}
            <h1 
              className="text-2xl sm:text-3xl font-light text-white/90 tracking-wide mb-3"
              style={{ 
                animation: 'fadeInUp 0.6s ease-out 0.2s',
                animationFillMode: 'both',
              }}
            >
              <span className="font-normal">Mind</span>
              <span 
                className="font-medium"
                style={{
                  background: 'linear-gradient(135deg, hsl(150 50% 60%) 0%, hsl(150 50% 50%) 50%, hsl(150 50% 55%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Ease
              </span>
            </h1>
            
            {/* Tagline */}
            <p 
              className="text-base text-white/60 font-light tracking-wide mb-10"
              style={{ 
                animation: 'fadeInUp 0.6s ease-out 0.3s',
                animationFillMode: 'both',
              }}
            >
              {t('safeSpace')}
            </p>
            
            {/* Continue button */}
            <div
              className="w-full flex flex-col items-center gap-4"
              style={{ 
                animation: 'fadeInUp 0.6s ease-out 0.5s',
                animationFillMode: 'both',
              }}
            >
              <button
                onClick={handleContinueInBrowser}
                className="w-full max-w-xs px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-lg shadow-green-500/20"
              >
                {t('continueToApp')}
              </button>
            </div>
          </main>

          <style>{`
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.9);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(15px);
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
    
    // Desktop gate view (no bypass)
    return (
      <div className="relative h-screen flex flex-col items-center justify-center bg-[#1a241f] overflow-hidden">
        {/* Glow background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(150 50% 50% / 0.12) 0%, transparent 60%)",
              filter: "blur(60px)",
            }}
          />
        </div>
        
        <main className="relative z-10 flex flex-col items-center justify-center px-8 text-center max-w-xl">
          {/* Logo */}
          <div
            className="mb-8"
            style={{ 
              animation: 'fadeInScale 0.8s ease-out',
              animationFillMode: 'both',
            }}
          >
            <BrandLogo size="lg" showText={false} />
          </div>
          
          {/* Wordmark */}
          <div
            className="mb-6"
            style={{ 
              animation: 'fadeInUp 0.6s ease-out 0.2s',
              animationFillMode: 'both',
            }}
          >
            <h1 className="text-3xl md:text-4xl font-light tracking-wide text-white/90">
              <span className="font-normal">Mind</span>
              <span 
                className="font-medium"
                style={{
                  background: 'linear-gradient(135deg, hsl(150 50% 60%) 0%, hsl(150 50% 50%) 50%, hsl(150 50% 55%) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Ease
              </span>
            </h1>
          </div>
          
          {/* Description */}
          <p
            className="text-base md:text-lg text-white/60 font-light tracking-wide mb-10 leading-relaxed"
            style={{ 
              animation: 'fadeInUp 0.6s ease-out 0.3s',
              animationFillMode: 'both',
            }}
          >
            {t('calmSpace')}
            <br />
            {t('designedForMobile')}
          </p>
          
          {/* Mobile-first notice */}
          <div
            className="flex items-center gap-3 mb-8 px-5 py-3 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              animation: 'fadeInUp 0.6s ease-out 0.4s',
              animationFillMode: 'both',
            }}
          >
            <div className="w-5 h-5" style={{ color: 'hsl(150 50% 50%)' }}>
              <SmartphoneIcon className="w-5 h-5" />
            </div>
            <span className="text-sm text-white/80">
              {t('bestExperienced')}
            </span>
          </div>
          
          {/* QR Code */}
          <div
            className="flex flex-col items-center gap-4"
            style={{ 
              animation: 'fadeInScale 0.6s ease-out 0.5s',
              animationFillMode: 'both',
            }}
          >
            <div className="p-4 rounded-2xl shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
              {typeof QRCodeSVG !== 'undefined' && QRCodeSVG ? (
                <QRCodeSVG
                  value={appUrl}
                  size={140}
                  level="M"
                  bgColor="hsl(80 10% 90%)"
                  fgColor="hsl(150 20% 10%)"
                />
              ) : (
                <div className="w-[140px] h-[140px] flex flex-col items-center justify-center text-xs text-gray-500 p-4 text-center">
                  <p>QR Code</p>
                  <p className="mt-2 text-[10px]">Install qrcode.react</p>
                </div>
              )}
            </div>
            <p className="text-sm text-white/60 font-light">
              {t('scanToOpen')}
            </p>
          </div>
          
          {/* Subtle decorative line */}
          <div 
            className="mt-12 w-16 h-px"
            style={{
              background: 'linear-gradient(to right, transparent, hsl(150 50% 50% / 0.2), transparent)',
              animation: 'fadeInScaleX 1s ease-out 0.8s',
              animationFillMode: 'both',
            }}
          />
        </main>

        <style>{`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeInScaleX {
            from {
              opacity: 0;
              transform: scaleX(0);
            }
            to {
              opacity: 1;
              transform: scaleX(1);
            }
          }
        `}</style>
      </div>
    );
  }

  // Mobile View - Allows mobile users to proceed to auth/login
  // Shows install option and "Continue in browser" button
  return (
    <div className="relative h-screen flex flex-col items-center justify-center bg-[#1a241f] overflow-hidden px-4 sm:px-6">
      {/* Glow background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(150 50% 50% / 0.12) 0%, transparent 60%)",
            filter: "blur(60px)",
          }}
        />
      </div>
      
      {/* Subtle background brand watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          animation: 'fadeIn 2s ease-out 1.5s',
          animationFillMode: 'both',
        }}
      >
        <div
          className="w-[350px] h-[350px] rounded-full"
          style={{
            background: "radial-gradient(circle, hsl(150 50% 50% / 0.05) 0%, transparent 70%)",
            filter: "blur(50px)",
          }}
        />
      </div>
      
      <main className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-sm">
        {/* Logo */}
        <div
          className="mb-6"
          style={{ 
            animation: 'fadeInScale 0.8s ease-out',
            animationFillMode: 'both',
          }}
        >
          <BrandLogo size="md" showText={false} />
        </div>
        
        {/* Wordmark */}
        <h1 
          className="text-2xl sm:text-3xl font-light text-white/90 tracking-wide mb-3"
          style={{ 
            animation: 'fadeInUp 0.6s ease-out 0.2s',
            animationFillMode: 'both',
          }}
        >
          <span className="font-normal">Mind</span>
          <span 
            className="font-medium"
            style={{
              background: 'linear-gradient(135deg, hsl(150 50% 60%) 0%, hsl(150 50% 50%) 50%, hsl(150 50% 55%) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Ease
          </span>
        </h1>
        
        {/* Tagline */}
        <p 
          className="text-base text-white/60 font-light tracking-wide mb-10"
          style={{ 
            animation: 'fadeInUp 0.6s ease-out 0.3s',
            animationFillMode: 'both',
          }}
        >
          {t('safeSpace')}
        </p>
        
        {/* Install CTA */}
        <div
          className="w-full flex flex-col items-center gap-4"
          style={{ 
            animation: 'fadeInUp 0.6s ease-out 0.5s',
            animationFillMode: 'both',
          }}
        >
          <button
            onClick={handleInstallClick}
            className="w-full max-w-xs px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-3"
          >
            <DownloadIcon className="w-5 h-5" />
            {isInstallable ? t('installMindEase') : t('addToHomeScreen')}
          </button>
          
          {/* Hint text */}
          {!showInstallInstructions && (
            <p
              className="text-xs text-white/50 font-light px-4 text-center leading-relaxed"
              style={{ 
                animation: 'fadeIn 0.6s ease-out 0.7s',
                animationFillMode: 'both',
              }}
            >
              {isInstallable 
                ? t('oneTapToAdd')
                : t('useBrowserMenu')
              }
            </p>
          )}

          {/* Install Instructions Panel */}
          {showInstallInstructions && (() => {
            const instructions = getInstallInstructions();
            if (!instructions) return null;
            
            return (
              <div
                className="w-full max-w-xs mt-2 p-5 rounded-xl border text-center"
                style={{
                  background: 'linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  animation: 'fadeInUp 0.4s ease-out',
                  animationFillMode: 'both',
                }}
              >
                <div className="flex flex-col items-center w-full">
                  <span className="text-3xl mb-3">{instructions.icon}</span>
                  <h3 className="text-sm font-medium text-white/90 mb-4 w-full text-center">
                    {t('howToInstall')}
                  </h3>
                  <ol className="space-y-3 text-xs text-white/70 font-light leading-relaxed w-full mb-5">
                    {instructions.steps.map((step, index) => (
                      <li key={index} className="flex gap-2.5 items-start">
                        <span className="text-green-400/80 font-medium shrink-0 mt-0.5">{index + 1}.</span>
                        <span className="flex-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <button
                    onClick={() => setShowInstallInstructions(false)}
                    className="w-full px-4 py-2.5 text-sm text-white font-medium rounded-lg transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-green-500/50 active:scale-[0.98]"
                    style={{
                      background: 'linear-gradient(135deg, hsl(150 50% 50% / 0.4) 0%, hsl(150 50% 50% / 0.3) 100%)',
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      boxShadow: '0 2px 12px hsl(150 50% 50% / 0.2)',
                    }}
                  >
                    {t('gotIt')}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
        
        {/* Continue without installing */}
        <div
          className="mt-8"
          style={{ 
            animation: 'fadeIn 0.6s ease-out 0.9s',
            animationFillMode: 'both',
          }}
        >
          <button
            onClick={handleContinueInBrowser}
            className="text-sm text-white/60 hover:text-green-400 transition-colors font-light underline-offset-4 hover:underline"
          >
            {t('continueInBrowser')}
          </button>
        </div>
        
        {/* Decorative line */}
        <div 
          className="mt-12 w-12 h-px"
          style={{
            background: 'linear-gradient(to right, transparent, hsl(150 50% 50% / 0.25), transparent)',
            animation: 'fadeInScaleX 1s ease-out 1.1s',
            animationFillMode: 'both',
          }}
        />
      </main>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
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
        @keyframes fadeInScaleX {
          from {
            opacity: 0;
            transform: scaleX(0);
          }
          to {
            opacity: 1;
            transform: scaleX(1);
          }
        }
      `}</style>
    </div>
  );
}
