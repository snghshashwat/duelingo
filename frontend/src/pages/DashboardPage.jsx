import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore } from "../store/gameStore";
import { authAPI, userAPI } from "../api/client";
import { initializeSocket, findMatch, offAll } from "../api/socket";
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { Activity, History, UserPlus, Swords, Trophy } from "lucide-react";

export default function DashboardPage() {
  const { user, logout, isDarkMode } = useAuthStore();
  const {
    setWaiting,
    setGameStatus,
    setPendingMode,
    setGameType,
    setTransitionCountdown,
  } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activePlayers, setActivePlayers] = useState([]);
  const [selectedGameType, setSelectedGameType] = useState("QUIZ_SPRINT");
  const matchmakingStartTimer = useRef(null);
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
      if (matchmakingStartTimer.current) {
        clearTimeout(matchmakingStartTimer.current);
      }
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
    setGameStatus("countdown");
    setGameType(selectedGameType);
    setTransitionCountdown(4);

    matchmakingStartTimer.current = setTimeout(() => {
      setGameStatus("finding");
      setTransitionCountdown(null);
      findMatch(user.id, user.username, selectedGameType);
    }, 4000);

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
            className={`text-base font-bold mb-3 flex items-center gap-2 ${isDarkMode ? "text-slate-100" : "text-slate-700"}`}
          >
            <Activity size={18} className="text-emerald-400" />
            {activePlayers.length} Active Players
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
                  } transition-all duration-300 hover:scale-[1.02]`}
                >
                  <p
                    className={`text-sm font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
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
          <div
            className={`text-center mb-8 rounded-3xl border p-7 shadow-xl ${
              isDarkMode
                ? "bg-slate-800/90 border-slate-700"
                : "bg-white/95 border-slate-200"
            }`}
          >
            <h3
              className={`text-base font-bold uppercase tracking-wide mb-4 ${
                isDarkMode ? "text-slate-200" : "text-slate-700"
              }`}
            >
              Game Mode
            </h3>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
              <button
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
                  selectedGameType === "QUIZ_SPRINT"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-800 font-semibold"
                }`}
                onClick={() => setSelectedGameType("QUIZ_SPRINT")}
              >
                Quiz Sprint (1 min)
              </button>
              <button
                className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-lg border ${
                  selectedGameType === "MATCH_PAIRS"
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white border-gray-300 text-gray-800 font-semibold"
                }`}
                onClick={() => setSelectedGameType("MATCH_PAIRS")}
              >
                Match the Following
              </button>
            </div>

            <h2
              className={`text-2xl sm:text-3xl font-black mb-4 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              Ready for a duel?
            </h2>
            <p
              className={`text-base sm:text-lg font-semibold mb-6 ${
                isDarkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {selectedGameType === "QUIZ_SPRINT"
                ? "Solve as many quiz questions as possible in 60 seconds."
                : "Solve 5 match-the-following rounds. Fastest total solve time wins."}
            </p>
            <button
              onClick={handleFindMatch}
              disabled={loading}
              className="btn-primary disabled:opacity-50 text-base sm:text-lg mb-4 inline-flex items-center gap-2"
            >
              <Swords size={18} />
              {loading ? "Finding match..." : "Find Match"}
            </button>

            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={() => navigate("/match-history")}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-blue-600 hover:bg-blue-700 text-white text-sm inline-flex items-center gap-2"
              >
                <History size={16} />
                Match History
              </button>
              <button
                onClick={() => navigate("/friend-requests")}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-300 bg-purple-600 hover:bg-purple-700 text-white text-sm inline-flex items-center gap-2"
              >
                <UserPlus size={16} />
                Friend Requests
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="card">
            <h2
              className={`text-2xl sm:text-3xl font-black mb-6 inline-flex items-center gap-2 ${
                isDarkMode ? "text-white" : "text-slate-900"
              }`}
            >
              <Trophy size={24} className="text-amber-400" />
              Top Players
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr
                    className={`border-b ${
                      isDarkMode ? "border-slate-600" : "border-slate-200"
                    }`}
                  >
                    <th
                      className={`text-left py-3 px-2 sm:px-4 text-sm sm:text-base font-extrabold ${
                        isDarkMode ? "text-slate-100" : "text-slate-700"
                      }`}
                    >
                      Rank
                    </th>
                    <th
                      className={`text-left py-3 px-2 sm:px-4 text-sm sm:text-base font-extrabold ${
                        isDarkMode ? "text-slate-100" : "text-slate-700"
                      }`}
                    >
                      Player
                    </th>
                    <th
                      className={`text-center py-3 px-2 sm:px-4 text-sm sm:text-base font-extrabold ${
                        isDarkMode ? "text-slate-100" : "text-slate-700"
                      }`}
                    >
                      Rating
                    </th>
                    <th
                      className={`text-center py-3 px-2 sm:px-4 text-sm sm:text-base font-extrabold ${
                        isDarkMode ? "text-slate-100" : "text-slate-700"
                      }`}
                    >
                      W/L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((player, index) => {
                    const isCurrentUser =
                      user?.id && String(player._id) === String(user.id);

                    return (
                      <tr
                        key={player._id}
                        className={`border-b transition-colors duration-300 ${
                          isDarkMode
                            ? isCurrentUser
                              ? "border-slate-600 bg-slate-700/45 hover:bg-slate-700/60"
                              : "border-slate-700 hover:bg-slate-700/35"
                            : isCurrentUser
                              ? "border-slate-200 bg-emerald-50 hover:bg-emerald-100"
                              : "border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <td
                          className={`py-3 px-2 sm:px-4 text-base sm:text-lg font-bold ${
                            isDarkMode ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          #{index + 1}
                        </td>
                        <td
                          className={`py-3 px-2 sm:px-4 text-base sm:text-lg font-bold ${
                            isDarkMode ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {player.username}
                        </td>
                        <td className="text-center py-3 px-2 sm:px-4">
                          <span className="bg-emerald-100 text-emerald-800 px-2 sm:px-3 py-1 rounded text-sm font-bold">
                            {player.rating}
                          </span>
                        </td>
                        <td
                          className={`text-center py-3 px-2 sm:px-4 text-base sm:text-lg font-bold ${
                            isDarkMode ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {player.wins}-{player.losses}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
