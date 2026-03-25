import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { userAPI } from "../api/client";
import Navbar from "../components/Navbar";

export default function OpponentProfilePage() {
  const navigate = useNavigate();
  const { opponentId } = useParams();
  const { user, logout, isDarkMode } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadHeadToHeadStats();
  }, [user, opponentId, navigate]);

  const loadHeadToHeadStats = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getHeadToHeadStats(opponentId);
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load stats:", error);
      setMessage("Failed to load opponent profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      setActionLoading(true);
      await userAPI.addFriend(stats.opponentUsername);
      setMessage("Friend request sent!");
      loadHeadToHeadStats();
    } catch (error) {
      setMessage(error.response?.data?.error || "Failed to send request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFriend = async () => {
    try {
      setActionLoading(true);
      await userAPI.removeFriend(stats.opponentId);
      setMessage("Friend removed");
      loadHeadToHeadStats();
    } catch (error) {
      setMessage("Failed to remove friend");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setActionLoading(true);
      await userAPI.acceptFriendRequest(stats.opponentId);
      setMessage("Friend request accepted!");
      loadHeadToHeadStats();
    } catch (error) {
      setMessage("Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <Navbar onLogout={logout} />
        <div className="min-h-screen flex items-center justify-center">
          <div
            className={`text-center py-8 rounded-lg ${
              isDarkMode
                ? "bg-slate-800 text-slate-400"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={isDarkMode ? "dark" : ""}>
        <Navbar onLogout={logout} />
        <div className="min-h-screen py-6 px-3 sm:px-4">
          <div className="max-w-4xl mx-auto">
            <div
              className={`text-center py-8 rounded-lg ${
                isDarkMode
                  ? "bg-slate-800 text-slate-400"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Opponent not found
            </div>
            <button
              onClick={() => navigate("/match-history")}
              className={`mt-4 px-4 py-2 rounded-lg font-semibold transition ${
                isDarkMode
                  ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              Back to Match History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <Navbar onLogout={logout} />

      <div className="min-h-screen py-6 px-3 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate("/match-history")}
            className={`mb-6 px-4 py-2 rounded-lg font-semibold transition ${
              isDarkMode
                ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            ← Back to Match History
          </button>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("success") ||
                message.includes("accepted") ||
                message.includes("sent")
                  ? isDarkMode
                    ? "bg-green-900/40 text-green-300 border border-green-700"
                    : "bg-green-100 text-green-800 border border-green-300"
                  : isDarkMode
                    ? "bg-red-900/40 text-red-300 border border-red-700"
                    : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Profile Card */}
          <div
            className={`card mb-8 p-6 ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div
                className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0 ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                    : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                }`}
              >
                {stats.opponentAvatar ? (
                  <img
                    src={stats.opponentAvatar}
                    alt={stats.opponentUsername}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-white">
                    {stats.opponentUsername?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1
                  className={`text-3xl font-bold mb-2 ${
                    isDarkMode ? "text-slate-100" : "text-slate-800"
                  }`}
                >
                  {stats.opponentUsername}
                </h1>
                <p
                  className={`text-lg mb-4 ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Rating:{" "}
                  <span className="font-bold">{stats.opponentRating}</span>
                </p>

                {/* Friend Status & Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap justify-center sm:justify-start">
                  {stats.isFriend && (
                    <>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          isDarkMode
                            ? "bg-green-700/50 text-green-200"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        ✓ Friend
                      </span>
                      <button
                        onClick={handleRemoveFriend}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          isDarkMode
                            ? "bg-red-900/50 hover:bg-red-800/70 text-red-200"
                            : "bg-red-100 hover:bg-red-200 text-red-700"
                        }`}
                      >
                        Remove Friend
                      </button>
                    </>
                  )}

                  {stats.requestSent && (
                    <span
                      className={`px-3 py-1 rounded text-sm font-semibold ${
                        isDarkMode
                          ? "bg-yellow-700/50 text-yellow-200"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      ⏳ Request Sent
                    </span>
                  )}

                  {stats.requestReceived && (
                    <>
                      <span
                        className={`px-3 py-1 rounded text-sm font-semibold ${
                          isDarkMode
                            ? "bg-blue-700/50 text-blue-200"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        📥 Pending Request
                      </span>
                      <button
                        onClick={handleAcceptRequest}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          isDarkMode
                            ? "bg-green-700 hover:bg-green-600 text-green-100"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        Accept
                      </button>
                    </>
                  )}

                  {!stats.isFriend &&
                    !stats.requestSent &&
                    !stats.requestReceived && (
                      <button
                        onClick={handleSendFriendRequest}
                        disabled={actionLoading}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          isDarkMode
                            ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                            : "bg-emerald-600 hover:bg-emerald-700 text-white"
                        }`}
                      >
                        Add Friend
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* Head-to-Head Stats */}
          <div
            className={`card p-6 ${
              isDarkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-slate-200"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-6 ${
                isDarkMode ? "text-slate-100" : "text-slate-800"
              }`}
            >
              Head-to-Head Record
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div
                className={`text-center p-4 rounded-lg ${
                  isDarkMode
                    ? "bg-green-700/30 border border-green-700"
                    : "bg-green-50 border border-green-200"
                }`}
              >
                <p
                  className={`text-3xl font-bold ${
                    isDarkMode ? "text-green-300" : "text-green-600"
                  }`}
                >
                  {stats.stats.wins}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Wins
                </p>
              </div>

              <div
                className={`text-center p-4 rounded-lg ${
                  isDarkMode
                    ? "bg-slate-700 border border-slate-600"
                    : "bg-slate-100 border border-slate-200"
                }`}
              >
                <p
                  className={`text-3xl font-bold ${
                    isDarkMode ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {stats.stats.draws}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Draws
                </p>
              </div>

              <div
                className={`text-center p-4 rounded-lg ${
                  isDarkMode
                    ? "bg-red-700/30 border border-red-700"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-3xl font-bold ${
                    isDarkMode ? "text-red-300" : "text-red-600"
                  }`}
                >
                  {stats.stats.losses}
                </p>
                <p
                  className={`text-sm ${
                    isDarkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Losses
                </p>
              </div>
            </div>

            {/* Total */}
            <div
              className={`mt-6 pt-6 border-t ${
                isDarkMode ? "border-slate-700" : "border-slate-200"
              }`}
            >
              <p
                className={`text-center text-lg font-semibold ${
                  isDarkMode ? "text-slate-300" : "text-slate-700"
                }`}
              >
                Total Matches:{" "}
                <span className="text-2xl">{stats.stats.total}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
