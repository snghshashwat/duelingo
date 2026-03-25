import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { authAPI } from "../api/client";

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { login, isDarkMode } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const response = await authAPI.me();
        const user = response.data.user;

        if (!user) {
          throw new Error("No user found in authenticated session");
        }

        localStorage.setItem("user", JSON.stringify(user));

        login(user, "cookie");

        // Redirect to dashboard
        navigate("/");
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Failed to process authentication. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
        isDarkMode
          ? "dark bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900"
          : "bg-gradient-to-br from-white via-blue-50 to-emerald-50"
      }`}
    >
      <div
        className={`w-full max-w-md px-6 py-8 rounded-2xl shadow-xl transition-all text-center space-y-6 ${
          isDarkMode
            ? "bg-slate-800/95 border border-slate-700"
            : "bg-white/95 border border-white"
        } backdrop-blur-lg`}
      >
        {error ? (
          <>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-red-400" : "text-red-600"
              }`}
            >
              ❌ Authentication Error
            </h2>
            <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
              {error}
            </p>
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Redirecting to login page...
            </p>
          </>
        ) : (
          <>
            <h2
              className={`text-2xl font-bold ${
                isDarkMode ? "text-blue-400" : "text-emerald-600"
              }`}
            >
              ✅ Welcome to Duelingo!
            </h2>
            <p className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
              Setting up your account...
            </p>
            <div className="flex justify-center">
              <div
                className={`inline-block animate-spin rounded-full h-8 w-8 border-b-2 ${
                  isDarkMode ? "border-blue-400" : "border-emerald-600"
                }`}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
