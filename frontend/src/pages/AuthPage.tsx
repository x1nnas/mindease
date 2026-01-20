import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/useAuth';
import { useLocation } from 'react-router-dom';

export default function AuthPage() {
  const { login, register, isLoading } = useAuth();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(() => !!location.state?.fromEntry);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    // Animate in if coming from EntryPage
    if (isEntering) {
      const timer = setTimeout(() => {
        setIsEntering(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEntering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
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
      // Error handling is done in the context
      console.error('Auth error:', error);
    }
  };

  const toggleMode = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsLogin(!isLogin);
      setPassword('');
      setFirstName('');
      setIsTransitioning(false);
    }, 150); // Half of transition duration
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a241f]">
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
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className={`w-full max-w-sm mx-auto px-6 transition-all duration-500 ease-in-out ${
          isEntering 
            ? 'opacity-0 transform translate-y-[-20px] scale-95' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}>
          {/* Card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`text-center relative transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'} ${isLogin ? 'mb-8 min-h-[80px]' : 'mb-6 min-h-[70px]'}`}>
              <h1 className="text-2xl font-semibold text-white mb-2">
                {isLogin ? "Welcome back" : "Create your sanctuary"}
              </h1>
              <p className="text-white/60 text-sm">
                {isLogin
                  ? "Continue your journey to inner peace"
                  : "Begin your path to emotional wellness"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* First Name - Register only */}
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isLogin 
                    ? 'max-h-0 opacity-0 mt-0 mb-0' 
                    : 'max-h-24 opacity-100'
                } ${isTransitioning ? 'opacity-0' : ''}`}
              >
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-white/80 mb-2">
                    First name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="How should we call you?"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                    required={!isLogin}
                  />
                </div>
              </div>

              {/* Email */}
              <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className={`transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform translate-x-2' : 'opacity-100 transform translate-x-0'}`}>
                <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                  required
                  minLength={8}
                />
              </div>

              {/* Submit Button */}
              <div className={`pt-2 transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                <button
                  type="submit"
                  disabled={isLoading || isTransitioning}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium rounded-xl hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Please wait..." : isLogin ? "Sign in" : "Start your journey"}
                </button>
              </div>
            </form>

            {/* Toggle */}
            <div className={`mt-6 text-center transition-all duration-300 ease-in-out ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              <button
                type="button"
                onClick={toggleMode}
                disabled={isTransitioning}
                className="text-sm text-white/60 hover:text-white/80 transition-colors duration-200 disabled:cursor-not-allowed"
              >
                {isLogin ? (
                  <>
                    New here?{" "}
                    <span className="text-green-400 font-medium">Create an account</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="text-green-400 font-medium">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Reassuring footer text */}
          <p className="text-center text-xs text-white/40 mt-6">
            Your data is safe and private with us
          </p>
        </div>
      </div>
    </div>
  );
}
