import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { userAPI } from "../api/client";
import Navbar from "../components/Navbar";

export default function MatchHistoryPage() {
  const navigate = useNavigate();
  const { user, logout, isDarkMode } = useAuthStore();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadMatchHistory();
  }, [user, navigate]);

  const loadMatchHistory = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getMatchHistory();
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
      );
      setMatches(sorted);
    } catch (error) {
      console.error("Failed to load match history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOpponent = (opponentId) => {
    navigate(`/opponent/${opponentId}`);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Navbar onLogout={logout} />

      <div className="min-h-screen py-6 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1
                className={`text-3xl sm:text-4xl font-bold mb-2 ${
                  isDarkMode ? "text-blue-300" : "text-slate-800"
                }`}
              >
                Match History
              </h1>
              <button
                onClick={() => navigate("/dashboard")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                Back
              </button>
            </div>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Your match results and statistics
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className={`text-center py-8 rounded-lg ${
                isDarkMode
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Loading...
            </div>
          )}

          {/* Empty State */}
          {!loading && matches.length === 0 && (
            <div
              className={`text-center py-8 rounded-lg ${
                isDarkMode
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              No matches yet. Play your first game!
            </div>
          )}

          {/* Matches List */}
          {!loading && matches.length > 0 && (
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <div
                  key={idx}
                  className={`card flex items-center justify-between p-4 hover:shadow-lg transition cursor-pointer ${
                    isDarkMode
                      ? "bg-slate-800 border-slate-700 hover:bg-slate-750"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                  onClick={() => handleViewOpponent(match.opponentId)}
                >
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-lg ${
                        isDarkMode ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      vs {match.opponentUsername}
                    </p>

                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {new Date(match.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year:
                          new Date(match.timestamp).getFullYear() !==
                          new Date().getFullYear()
                            ? "numeric"
                            : undefined,
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div
                    className={`text-right px-4 py-2 rounded-lg font-bold ${
                      match.isDraw
                        ? isDarkMode
                          ? "bg-slate-700 text-slate-200"
                          : "bg-slate-200 text-slate-700"
                        : match.won
                          ? isDarkMode
                            ? "bg-green-700/50 text-green-200"
                            : "bg-green-100 text-green-700"
                          : isDarkMode
                            ? "bg-red-700/50 text-red-200"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {match.isDraw ? "DRAW" : match.won ? "WIN" : "LOSS"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
