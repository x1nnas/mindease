import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import WelcomePage from './pages/WelcomePage';
import ChatPage from './pages/ChatPage';

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/chat"
        element={isAuthenticated ? <ChatPage /> : <AuthPage />}
      />
      <Route
        path="/welcome"
        element={isAuthenticated ? <WelcomePage /> : <AuthPage />}
      />
      <Route
        path="/"
        element={isAuthenticated ? <WelcomePage /> : <AuthPage />}
      />
    </Routes>
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
