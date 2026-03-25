import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { authAPI } from "../api/client";

const LANGUAGES = ["English", "Italian", "French", "Spanish", "German"];

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nativeLanguage, setNativeLanguage] = useState("English");
  const [learningLanguage, setLearningLanguage] = useState("Spanish");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup, isDarkMode } = useAuthStore();
  const apiOrigin =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5051";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup(
        username,
        email,
        password,
        nativeLanguage,
        learningLanguage,
      );
      const { user } = response.data;

      localStorage.setItem("user", JSON.stringify(user));

      signup(user, "cookie");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
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
            Start your language journey.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span
                className={`text-xs font-semibold ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Native
              </span>
              <select
                value={nativeLanguage}
                onChange={(e) => {
                  const next = e.target.value;
                  setNativeLanguage(next);
                  if (learningLanguage === next) {
                    const fallback =
                      LANGUAGES.find((x) => x !== next) || "Spanish";
                    setLearningLanguage(fallback);
                  }
                }}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span
                className={`text-xs font-semibold ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Learning
              </span>
              <select
                value={learningLanguage}
                onChange={(e) => setLearningLanguage(e.target.value)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                  isDarkMode
                    ? "bg-slate-700 border-slate-600 text-slate-100"
                    : "bg-slate-50 border-slate-300 text-slate-900"
                }`}
              >
                {LANGUAGES.filter((lang) => lang !== nativeLanguage).map(
                  (lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>

          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
              placeholder="Username"
              required
            />
          </div>

          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
              placeholder="Email"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
              placeholder="Password"
              required
            />
          </div>

          <div>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none ${
                isDarkMode
                  ? "bg-slate-700 border-slate-600 text-slate-100"
                  : "bg-slate-50 border-slate-300 text-slate-900"
              }`}
              placeholder="Confirm password"
              required
            />
          </div>

          {error && (
            <div
              className={`text-sm ${
                isDarkMode ? "text-red-300" : "text-red-600"
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition ${
              isDarkMode
                ? "bg-emerald-600 hover:bg-emerald-500"
                : "bg-emerald-600 hover:bg-emerald-700"
            } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {loading ? "Creating account..." : "Create account"}
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
          onClick={handleGoogleSignup}
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
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-emerald-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
