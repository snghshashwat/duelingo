import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/client";
import { useAuthStore } from "../store/gameStore";
import SiteFooter from "../components/SiteFooter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isDarkMode } = useAuthStore();

  const apiOrigin =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5051";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));
      login(user, "cookie");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const frontendUrl = encodeURIComponent(window.location.origin);
    window.location.href = `${apiOrigin}/api/auth/google?frontendUrl=${frontendUrl}`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1920&q=80"
        alt="Language learning backdrop"
        className="absolute inset-0 h-full w-full object-cover scale-105 hero-pan"
      />

      <div
        className={`absolute inset-0 ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-950/90 via-slate-900/85 to-blue-950/90"
            : "bg-gradient-to-br from-emerald-950/75 via-slate-900/70 to-sky-900/75"
        }`}
      />

      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl float-slow" />
      <div className="absolute top-1/3 -right-20 h-72 w-72 rounded-full bg-sky-400/25 blur-3xl float-reverse" />
      <div className="absolute -bottom-28 left-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl float-slow" />

      <div className="relative z-10 min-h-screen px-4 py-10 lg:py-12">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
          <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
            <section className="hero-entrance rounded-3xl border border-white/20 bg-black/20 p-6 text-white shadow-2xl backdrop-blur-md sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-200">
                Real-time Duels
              </div>

              <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                Speak Faster.
                <span className="block text-emerald-300">Think Sharper.</span>
              </h1>

              <p className="mt-5 max-w-xl text-sm text-slate-200 sm:text-base">
                Jump into live 1v1 language battles, challenge your friends, and
                climb the leaderboard with every correct answer.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/25 bg-white/10 p-3 text-center backdrop-blur">
                  <p className="text-xl font-black sm:text-2xl">2 Modes</p>
                  <p className="text-xs text-slate-200">Quiz + Match Pairs</p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/10 p-3 text-center backdrop-blur">
                  <p className="text-xl font-black sm:text-2xl">Live</p>
                  <p className="text-xs text-slate-200">Friend challenges</p>
                </div>
                <div className="rounded-2xl border border-white/25 bg-white/10 p-3 text-center backdrop-blur">
                  <p className="text-xl font-black sm:text-2xl">Ranked</p>
                  <p className="text-xs text-slate-200">Rating system</p>
                </div>
              </div>
            </section>

            <section
              className={`hero-entrance-delayed w-full rounded-3xl border p-7 shadow-xl backdrop-blur-xl ${
                isDarkMode
                  ? "border-slate-600/70 bg-slate-900/80"
                  : "border-white/50 bg-white/85"
              }`}
            >
              <div className="text-center mb-6">
                <img
                  src="/logo.png"
                  alt="Duelingo"
                  className="h-16 mx-auto mb-3 drop-shadow"
                />
                <h2
                  className={`text-3xl font-black tracking-tight ${
                    isDarkMode ? "text-emerald-300" : "text-emerald-700"
                  }`}
                >
                  Welcome Back
                </h2>
                <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
                  Sign in and continue your streak.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                    isDarkMode
                      ? "bg-slate-800/80 border-slate-600 text-slate-100"
                      : "bg-white/90 border-slate-300 text-slate-900"
                  }`}
                  required
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                    isDarkMode
                      ? "bg-slate-800/80 border-slate-600 text-slate-100"
                      : "bg-white/90 border-slate-300 text-slate-900"
                  }`}
                  required
                />

                {error ? (
                  <p
                    className={`text-sm ${isDarkMode ? "text-red-300" : "text-red-600"}`}
                  >
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition ${
                    isDarkMode
                      ? "bg-emerald-600 hover:bg-emerald-500"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-300/70" />
                <span
                  className={
                    isDarkMode
                      ? "text-slate-400 text-xs"
                      : "text-slate-500 text-xs"
                  }
                >
                  OR
                </span>
                <div className="h-px flex-1 bg-slate-300/70" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                  isDarkMode
                    ? "bg-slate-800/80 border-slate-600 text-slate-100 hover:bg-slate-700"
                    : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
                }`}
              >
                Continue with Google
              </button>

              <p
                className={`mt-5 text-center text-sm ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
              >
                New here?{" "}
                <Link to="/signup" className="font-bold text-emerald-600">
                  Create account
                </Link>
              </p>
            </section>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <SiteFooter translucent />
      </div>
    </div>
  );
}
