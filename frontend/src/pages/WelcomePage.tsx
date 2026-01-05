import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/chat');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const firstName = user?.email?.split('@')[0] || '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-sky-500/20">
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            {firstName ? `Welcome, ${firstName}` : "Welcome to MindEase"}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Take a moment to settle in. You're safe here.
          </p>
        </div>
      </div>
    </div>
  );
}
