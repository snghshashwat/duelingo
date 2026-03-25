import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore } from "../store/gameStore";
import { authAPI, userAPI } from "../api/client";
import { initializeSocket, findMatch, offAll } from "../api/socket";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const { user, logout, isDarkMode } = useAuthStore();
  const { setWaiting, setGameStatus, setPendingMode, setGameType } =
    useGameStore();
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState("QUIZ_SPRINT");
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize socket connection
    if (user) {
      initializeSocket(user.id, user.username);
    }

    // Load leaderboard
    loadLeaderboard();
    loadActivePlayers();

    return () => {
      offAll();
    };
  }, [user]);

  const loadLeaderboard = async () => {
    try {
      const response = await userAPI.getLeaderboard(10);
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const loadActivePlayers = async () => {
    try {
      const response = await userAPI.getActivePlayers();
      setActivePlayers(response.data || []);
    } catch (error) {
      console.error("Failed to load active players:", error);
    }
  };

  const handleFindMatch = async () => {
    setLoading(true);
    setWaiting(true);
    setPendingMode("random");
    setGameStatus("finding");
    setGameType(selectedGameType);
    findMatch(user.id, user.username, selectedGameType);
    navigate("/game");
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // Always clear local state even if server logout fails.
    }
    localStorage.removeItem("user");
    logout();
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Navbar onLogout={handleLogout} />
      {/* Active Players Section */}
      <div
        className={`${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"} border-b py-4`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h3
            className={`text-sm font-semibold mb-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
          >
            🟢 {activePlayers.length} Active Players
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {activePlayers.length === 0 ? (
              <p
                className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                No active players right now. Be first to play!
              </p>
            ) : (
              activePlayers.map((player) => (
                <div
                  key={player._id}
                  className={`flex-shrink-0 min-w-[120px] px-3 sm:px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-700 border border-slate-600"
                      : "bg-slate-50 border border-slate-200"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
                  >
                    {player.username}
                  </p>
                  <p
                    className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Rating: {player.rating}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Find Match Button */}
          <div className={`card text-center mb-8 ${isDarkMode ? "dark" : ""}`}>
            <h3 className="text-sm uppercase tracking-wide text-gray-500 mb-3">
              Game Mode
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
              <button
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
                  selectedGameType === "QUIZ_SPRINT"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onClick={() => setSelectedGameType("QUIZ_SPRINT")}
              >
                Quiz Sprint (1 min)
              </button>
              <button
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
                  selectedGameType === "MATCH_PAIRS"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-700"
                }`}
                onClick={() => setSelectedGameType("MATCH_PAIRS")}
              >
                Match the Following
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-4">
              Ready for a duel?
            </h2>
            <p className="text-sm sm:text-base text-gray-400 mb-6">
              {selectedGameType === "QUIZ_SPRINT"
                ? "Solve as many quiz questions as possible in 60 seconds."
                : "Solve 5 match-the-following rounds. Fastest total solve time wins."}
            </p>
            <button
              onClick={handleFindMatch}
              disabled={loading}
              className="btn-primary disabled:opacity-50 text-base sm:text-lg mb-4"
            >
              {loading ? "⏳ Finding match..." : "🎯 Find Match"}
            </button>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate("/match-history")}
                className="px-4 py-2 rounded-lg font-semibold transition bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                📋 Match History
              </button>
              <button
                onClick={() => navigate("/friend-requests")}
                className="px-4 py-2 rounded-lg font-semibold transition bg-purple-600 hover:bg-purple-700 text-white text-sm"
              >
                📥 Friend Requests
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              🏆 Top Players
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">
                      Rank
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 text-xs sm:text-sm">
                      Player
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm">
                      Rating
                    </th>
                    <th className="text-center py-3 px-2 sm:px-4 text-xs sm:text-sm">
                      W/L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => (
                    <tr
                      key={player._id}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="py-3 px-2 sm:px-4 text-sm">
                        #{index + 1}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-sm">
                        {player.username}
                      </td>
                      <td className="text-center py-3 px-2 sm:px-4">
                        <span className="bg-emerald-100 text-emerald-700 px-2 sm:px-3 py-1 rounded text-xs sm:text-sm">
                          {player.rating}
                        </span>
                      </td>
                      <td className="text-center py-3 px-2 sm:px-4 text-sm">
                        {player.wins}-{player.losses}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
