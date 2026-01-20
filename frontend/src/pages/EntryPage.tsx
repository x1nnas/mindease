import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function EntryPage() {
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show for 2 seconds, then start exit animation
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2000);

    // Navigate after exit animation completes
    const navigateTimer = setTimeout(() => {
      navigate('/auth', { replace: true, state: { fromEntry: true } });
    }, 2500); // Navigate after transition completes

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1a241f]">
      {/* Organic gradient background */}
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
      
      {/* Centered content - matching AuthPage mobile sizing */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <main className={`flex flex-col items-center justify-center px-8 text-center transition-all duration-500 ease-in-out ${
          isExiting 
            ? 'opacity-0 transform translate-y-[-20px] scale-95' 
            : 'opacity-100 transform translate-y-0 scale-100'
        }`}>
          {/* Primary calming text */}
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl font-light text-white/90 tracking-wide"
            style={{ 
              animation: 'fadeUp 1.2s ease-out',
              animationFillMode: 'both',
            }}
          >
            Welcome to MindEase
          </h1>
          
          {/* Subtle secondary line */}
          <p 
            className="mt-4 text-base sm:text-lg text-white/60 font-light tracking-wide"
            style={{ 
              animation: 'fadeUp 1.4s ease-out 0.4s',
              animationFillMode: 'both',
            }}
          >
            your safe space to breathe
          </p>
          
          {/* Gentle decorative line */}
          <div 
            className="mt-8 w-12 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent"
            style={{ 
              animation: 'fadeUp 1.6s ease-out 0.8s',
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

