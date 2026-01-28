import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n/useLanguage';
import { BrandLogo } from '../components/BrandLogo';

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(() => !!location.state?.fromEntry);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Animate in if coming from EntryPage
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  // Clear error when switching between login/register
  useEffect(() => {
    setError(null);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.target as HTMLFormElement;
    const isValid = form.checkValidity();
    
    console.log('AuthPage: Form submitted', {
      isLogin,
      email: email.substring(0, 5) + '...',
      hasPassword: !!password,
      hasFirstName: !!firstName,
      isLoading,
      isTransitioning,
      formValid: isValid,
    });
    
    // If form is invalid, show validation errors
    if (!isValid) {
      console.warn('AuthPage: Form validation failed');
      form.reportValidity();
      return;
    }
    
    // Clear any previous errors
    setError(null);
    
    // Basic validation
    if (!email.trim() || !password.trim()) {
      setError(t('pleaseFillAllFields') || 'Please fill in all fields');
      return;
    }
    
    // Register-specific validation
    if (!isLogin) {
      if (!firstName.trim()) {
        setError(t('pleaseFillAllFields') || 'Please fill in all fields');
        return;
      }
      if (password.length < 8) {
        setError(t('passwordTooShort') || 'Password must be at least 8 characters');
        return;
      }
    }

    try {
      console.log('AuthPage: Starting', isLogin ? 'login' : 'registration');
      console.log('AuthPage: API URL:', import.meta.env.VITE_API_URL);
      console.log('AuthPage: Email:', email);
      console.log('AuthPage: Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
      
      if (isLogin) {
        console.log('AuthPage: Calling login API...');
        await login(email, password);
        console.log('AuthPage: Login successful');
      } else {
        console.log('AuthPage: Calling register API...');
        await register(email, password);
        console.log('AuthPage: Registration successful');
        // Store firstName in localStorage for WelcomePage
        if (firstName.trim()) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const user = JSON.parse(storedUser);
              user.firstName = firstName.trim();
              localStorage.setItem('user', JSON.stringify(user));
            } catch {
              // If parsing fails, just store firstName separately
              localStorage.setItem('userFirstName', firstName.trim());
            }
          } else {
            localStorage.setItem('userFirstName', firstName.trim());
          }
        }
      }
    } catch (error) {
      console.error('AuthPage: Auth error:', error);
      console.error('AuthPage: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage = error instanceof Error 
        ? error.message 
        : (isLogin ? 'Login failed. Please try again.' : 'Registration failed. Please try again.');
      setError(errorMessage);
    }
  };

  const toggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setPassword('');
      setFirstName('');
      setIsTransitioning(false);
    }, 300); // Match transition duration
  };

  return (
    <div className="relative h-screen overflow-hidden bg-[#1a241f]">
      {/* Glow background layer */}
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

      {/* Content layer */}
      <div className="relative z-10 flex h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-12 overflow-y-auto">
        <div 
          className={`w-full max-w-sm mx-auto transition-all duration-700 ease-out ${
            isEntering 
              ? 'opacity-0 transform translate-y-[-20px] scale-95' 
              : 'opacity-100 transform translate-y-0 scale-100'
          }`}
          style={{
            animation: isEntering ? undefined : 'fadeInUp 0.7s ease-out 0.3s both',
          }}
        >
          {/* Logo with title */}
          <div 
            className="mb-10"
            style={{
              animation: isEntering ? undefined : 'fadeInUp 0.6s ease-out 0.2s both',
            }}
          >
            <BrandLogo size="sm" showText={true} />
          </div>

          {/* Card */}
          <div 
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden"
            style={{
              animation: isEntering ? undefined : 'scaleIn 0.5s ease-out 0.4s both',
            }}
          >
            {/* Header */}
            <div 
              className={`text-center relative transition-all duration-300 ease-in-out ${
                isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
              } ${isLogin ? 'mb-8 min-h-[80px]' : 'mb-6 min-h-[70px]'}`}
            >
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isLogin ? t('welcomeBack') : t('createSanctuary')}
              </h2>
              <p className="text-white/60 text-sm">
                {isLogin
                  ? t('continueJourney')
                  : t('beginPath')}
              </p>
            </div>

            {/* Form */}
            <form 
              onSubmit={handleSubmit} 
              className="space-y-5"
              noValidate
              style={{
                position: 'relative',
                zIndex: 1,
              }}
            >
              {/* First Name - Register only */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isLogin 
                    ? 'max-h-0 opacity-0 mt-0 mb-0' 
                    : 'max-h-24 opacity-100 mt-0 mb-5'
                } ${isTransitioning ? 'opacity-0' : ''}`}
              >
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
                    {t('firstName')}
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder={t('firstNamePlaceholder')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                    required={!isLogin}
                    disabled={isLogin}
                    aria-hidden={isLogin}
                  />
                </div>
              </div>

              {/* Email */}
              <div 
                className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}
                style={{
                  animation: isEntering ? undefined : 'fadeInUp 0.4s ease-out 0.5s both',
                }}
              >
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div 
                className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}
                style={{
                  animation: isEntering ? undefined : 'fadeInUp 0.4s ease-out 0.6s both',
                }}
              >
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                  required
                  minLength={8}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="mt-4 p-3 rounded-xl text-sm text-white/90"
                  role="alert"
                  style={{
                    background: 'linear-gradient(135deg, hsl(150 50% 50% / 0.15) 0%, hsl(150 50% 50% / 0.08) 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 2px 12px hsl(150 50% 50% / 0.2)',
                  }}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-green-400/80 flex-shrink-0 mt-0.5">⚠️</span>
                    <span className="flex-1">{error}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div 
                className={`pt-2 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}
                style={{
                  animation: isEntering ? undefined : 'fadeInUp 0.4s ease-out 0.7s both',
                }}
              >
                <button
                  type="submit"
                  disabled={isLoading || isTransitioning}
                  onClick={(e) => {
                    // Debug logging for mobile
                    console.log('AuthPage: Button clicked/touched', {
                      isLoading,
                      isTransitioning,
                      disabled: e.currentTarget.disabled,
                      type: e.type,
                      isLogin,
                    });
                    
                    // If button is disabled, prevent any action
                    if (isLoading || isTransitioning) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    
                    // Don't interfere with form submission - let the form handle it
                    // The form's onSubmit handler will process the request
                  }}
                  onTouchStart={(e) => {
                    // Ensure touch events are captured
                    console.log('AuthPage: Button touch start');
                    if (!isLoading && !isTransitioning) {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onTouchEnd={(e) => {
                    console.log('AuthPage: Button touch end');
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20 active:scale-[0.98]"
                  style={{
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitUserSelect: 'none',
                    userSelect: 'none',
                    cursor: (isLoading || isTransitioning) ? 'not-allowed' : 'pointer',
                    minHeight: '44px', // iOS recommended touch target size
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {isLoading ? t('pleaseWait') : isLogin ? t('signIn') : t('startJourney')}
                </button>
              </div>
            </form>

            {/* Toggle */}
            <div 
              className={`mt-6 text-center transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}
              style={{
                animation: isEntering ? undefined : 'fadeIn 0.4s ease-out 0.8s both',
              }}
            >
              <button
                type="button"
                onClick={toggleMode}
                disabled={isTransitioning}
                className="text-sm text-white/60 hover:text-green-400 transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isLogin ? (
                  <>
                    {t('newHere')}{" "}
                    <span className="text-green-400 font-medium">{t('createAccount')}</span>
                  </>
                ) : (
                  <>
                    {t('alreadyHaveAccount')}{" "}
                    <span className="text-green-400 font-medium">{t('signIn')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reassuring footer text */}
          <p 
            className="text-center text-xs text-white/40 mt-6"
            style={{
              animation: isEntering ? undefined : 'fadeIn 0.6s ease-out 1s both',
            }}
          >
            {t('dataSafe')}
          </p>
        </div>
      </div>

      <style>{`
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

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
      `}</style>
    </div>
  );
}
