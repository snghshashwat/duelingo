import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/client";
import { useAuthStore } from "../store/gameStore";

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
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-10 ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950"
          : "bg-gradient-to-br from-lime-50 via-sky-50 to-emerald-100"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-3xl border p-7 shadow-xl backdrop-blur ${
          isDarkMode
            ? "bg-slate-800/90 border-slate-700"
            : "bg-white/90 border-white"
        }`}
      >
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Duelingo" className="h-16 mx-auto mb-3" />
          <h1
            className={`text-3xl font-black tracking-tight ${
              isDarkMode ? "text-emerald-300" : "text-emerald-700"
            }`}
          >
            Duelingo
          </h1>
          <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            Clean, fast language duels.
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
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-50 border-slate-300 text-slate-900"
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
                ? "bg-slate-700 border-slate-600 text-slate-100"
                : "bg-slate-50 border-slate-300 text-slate-900"
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
          <div className="h-px flex-1 bg-slate-300" />
          <span
            className={
              isDarkMode ? "text-slate-400 text-xs" : "text-slate-500 text-xs"
            }
          >
            OR
          </span>
          <div className="h-px flex-1 bg-slate-300" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={`w-full rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            isDarkMode
              ? "bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600"
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
      </div>
    </div>
  );
}
