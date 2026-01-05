import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
      navigate("/welcome");
    } catch (err) {
      setError(err instanceof Error ? err.message : `${mode === "login" ? "Login" : "Registration"} failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-sky-500/20">
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl bg-white/70 p-8 shadow-xl backdrop-blur-md">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {mode === "login" ? "Welcome back" : "Create your space"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {mode === "login"
              ? "Good to see you again."
              : "A calm place to check in with yourself."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
            />

            {mode === "register" && (
              <input
                type="password"
                placeholder="Confirm password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-400"
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full rounded-xl bg-indigo-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : mode === "login"
                ? "Log in"
                : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-indigo-500 hover:underline"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="font-medium text-indigo-500 hover:underline"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
