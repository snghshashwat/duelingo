import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, userAPI } from "../api/client";
import Navbar from "../components/Navbar";
import { useAuthStore } from "../store/gameStore";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getLeaderboard(50);
      setLeaderboard(response.data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen">
      <Navbar onLogout={handleLogout} />

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center">
          🏆 Global Leaderboard
        </h1>

        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    Rank
                  </th>
                  <th className="text-left py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    Player
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    Rating
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    Wins
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    Losses
                  </th>
                  <th className="text-center py-4 px-3 sm:px-6 text-xs sm:text-sm">
                    W/L Ratio
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const winRate =
                    player.totalMatches > 0
                      ? ((player.wins / player.totalMatches) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr
                      key={player._id}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition"
                    >
                      <td className="py-4 px-3 sm:px-6">
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </td>
                      <td className="py-4 px-3 sm:px-6">
                        <span className="font-semibold">{player.username}</span>
                      </td>
                      <td className="text-center py-4 px-3 sm:px-6">
                        <span className="bg-green-900 text-green-200 px-3 py-1 rounded font-bold">
                          {player.rating}
                        </span>
                      </td>
                      <td className="text-center py-4 px-3 sm:px-6 text-blue-400">
                        {player.wins}
                      </td>
                      <td className="text-center py-4 px-3 sm:px-6 text-red-400">
                        {player.losses}
                      </td>
                      <td className="text-center py-4 px-3 sm:px-6">
                        <span className="text-yellow-400">{winRate}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-8">
          <button onClick={() => navigate("/")} className="btn-primary">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
