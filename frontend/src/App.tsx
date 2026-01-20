import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './providers/AuthProvider';
import { useAuth } from './contexts/useAuth';
import AuthPage from './pages/AuthPage';
import EntryPage from './pages/EntryPage';
import WelcomePage from './pages/WelcomePage';
import MoodCheckInPage from './pages/MoodCheckInPage';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import JournalPage from './pages/JournalPage';
import BottomNavigation from './components/BottomNavigation';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-[#1a241f] overflow-hidden">
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
        {/* Loading content */}
        <div className="relative z-10 flex flex-col items-center gap-4">
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
          <p className="text-white/60 text-sm font-light tracking-wide">Loading...</p>
        </div>
        <style>{`
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
        `}</style>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Preview route - always accessible for development */}
        <Route
          path="/preview-auth"
          element={<AuthPage />}
        />
        <Route
          path="/mood-check-in"
          element={isAuthenticated ? <MoodCheckInPage /> : <EntryPage />}
        />
        <Route
          path="/home"
          element={isAuthenticated ? <HomePage /> : <EntryPage />}
        />
        <Route
          path="/chat"
          element={isAuthenticated ? <ChatPage /> : <EntryPage />}
        />
        <Route
          path="/journal"
          element={isAuthenticated ? <JournalPage /> : <EntryPage />}
        />
        <Route
          path="/welcome"
          element={isAuthenticated ? <WelcomePage /> : <EntryPage />}
        />
        <Route
          path="/auth"
          element={isAuthenticated ? <WelcomePage /> : <AuthPage />}
        />
        <Route
          path="/"
          element={isAuthenticated ? <WelcomePage /> : <EntryPage />}
        />
      </Routes>
      {/* Bottom Navigation - shown on all authenticated pages except chat */}
      <BottomNavigation />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
