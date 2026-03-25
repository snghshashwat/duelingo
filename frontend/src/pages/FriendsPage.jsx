import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore } from "../store/gameStore";
import { authAPI, userAPI } from "../api/client";
import {
  initializeSocket,
  challengeFriend,
  onChallengeDeclined,
  onChallengeError,
  offAll,
} from "../api/socket";
import Navbar from "../components/Navbar";
import GameModeModal from "../components/GameModeModal";

export default function FriendsPage() {
  const navigate = useNavigate();
  const { user, logout, isDarkMode } = useAuthStore();
  const { setWaiting, setGameStatus, setPendingMode, setGameType } =
    useGameStore();
  const [friends, setFriends] = useState([]);
  const [onlineFriendIds, setOnlineFriendIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [challengingFriendId, setChallengingFriendId] = useState(null);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);
  const [selectedFriendForChallenge, setSelectedFriendForChallenge] =
    useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user) {
      initializeSocket(user.id, user.username);
    }

    loadFriends();
    loadFriendPresence();

    const presenceInterval = setInterval(() => {
      loadFriendPresence();
    }, 5000);

    onChallengeDeclined(() => {
      setChallengingFriendId(null);
      setLoading(false);
      setWaiting(false);
      setGameStatus("idle");
      setMessage("Challenge was declined");
    });

    onChallengeError((payload) => {
      setChallengingFriendId(null);
      setLoading(false);
      setWaiting(false);
      setGameStatus("idle");
      setMessage(payload?.message || "Challenge failed");
    });

    return () => {
      clearInterval(presenceInterval);
      offAll();
    };
  }, [user, navigate]);

  const loadFriends = async () => {
    try {
      const response = await userAPI.getFriends();
      // Deduplicate friends by userId to prevent duplicates
      const uniqueFriends = [];
      const seenIds = new Set();
      for (const friend of response.data || []) {
        const friendId = friend.userId?.toString() || friend._id?.toString();
        if (friendId && !seenIds.has(friendId)) {
          seenIds.add(friendId);
          uniqueFriends.push(friend);
        }
      }
      setFriends(uniqueFriends);
      setMessage("");
    } catch (error) {
      setMessage("Failed to load friends");
      console.error(error);
    }
  };

  const loadFriendPresence = async () => {
    try {
      const response = await userAPI.getFriendPresence();
      setOnlineFriendIds(new Set(response.data?.onlineFriendIds || []));
    } catch (error) {
      console.error("Failed to load friend presence:", error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await userAPI.searchUsers(query);
      setSearchResults(response.data || []);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async (userId) => {
    try {
      setLoading(true);
      await userAPI.addFriend(userId);
      setSearchQuery("");
      setSearchResults([]);
      setMessage("Friend request sent!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(
        error.response?.data?.error || "Failed to send friend request",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    try {
      setLoading(true);
      await userAPI.removeFriend(friendId);
      loadFriends();
      setMessage("Friend removed");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to remove friend");
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeFriend = (friend) => {
    if (!user) return;

    // Open game mode modal instead of directly challenging
    setSelectedFriendForChallenge(friend);
    setIsGameModeModalOpen(true);
  };

  const handleGameModeSelected = (gameMode) => {
    if (!user || !selectedFriendForChallenge) return;

    setChallengingFriendId(selectedFriendForChallenge.userId);
    setLoading(true);
    setWaiting(true);
    setGameStatus("waiting");
    setPendingMode("friend");
    setGameType(gameMode);

    challengeFriend(
      user.id,
      selectedFriendForChallenge.userId,
      user.username,
      gameMode,
    );
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

      <div
        className={`min-h-screen ${isDarkMode ? "bg-gradient-to-br from-slate-900 to-slate-800" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-3xl sm:text-4xl font-bold mb-2 ${isDarkMode ? "text-blue-300" : "text-slate-800"}`}
            >
              Friends
            </h1>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Manage your friends and challenge them to duels
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("success") || message.includes("added")
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

          {/* Search Friends Section */}
          <div className={`card mb-8 ${isDarkMode ? "dark" : ""}`}>
            <div className="flex items-center justify-between mb-4">
              <h2
                className={`text-2xl font-bold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
              >
                Search Friends
              </h2>
              <button
                onClick={() => navigate("/friend-requests")}
                className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                  isDarkMode
                    ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                📋 Requests
              </button>
            </div>
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by username or email (email stays private)"
                className={`input-field w-full ${isDarkMode ? "dark" : ""}`}
              />
              {searchQuery.length > 0 && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {isSearching && (
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Searching...
                    </p>
                  )}

                  {!isSearching && searchResults.length === 0 && (
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      No users found
                    </p>
                  )}

                  {searchResults.map((result) => (
                    <div
                      key={result._id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isDarkMode
                          ? "border-slate-700 bg-slate-700/30"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div>
                        <p
                          className={`font-semibold ${
                            isDarkMode ? "text-slate-100" : "text-slate-800"
                          }`}
                        >
                          {result.username}
                        </p>
                        <p
                          className={`text-xs ${
                            isDarkMode ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Rating: {result.rating}
                        </p>
                      </div>

                      {result.isFriend && (
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            isDarkMode
                              ? "bg-green-700/50 text-green-200"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          ✓ Friend
                        </span>
                      )}

                      {result.requestSent && (
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

                      {result.requestReceived && (
                        <span
                          className={`px-3 py-1 rounded text-sm font-semibold ${
                            isDarkMode
                              ? "bg-blue-700/50 text-blue-200"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          📥 Pending
                        </span>
                      )}

                      {!result.isFriend &&
                        !result.requestSent &&
                        !result.requestReceived && (
                          <button
                            onClick={() =>
                              handleSendFriendRequest(result.username)
                            }
                            disabled={loading}
                            className={`px-4 py-1 rounded text-sm font-semibold transition ${
                              isDarkMode
                                ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            Add
                          </button>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Friends List */}
          <div>
            <h2
              className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
            >
              Your Friends ({friends.length})
            </h2>

            {friends.length === 0 ? (
              <div
                className={`card text-center py-8 ${isDarkMode ? "dark" : ""}`}
              >
                <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
                  No friends yet. Add one to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friend) => {
                  const isOnline = onlineFriendIds.has(
                    friend.userId?.toString(),
                  );
                  return (
                    <div
                      key={friend.userId}
                      className={`card ${isDarkMode ? "dark" : ""}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="relative">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                isDarkMode
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                  : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                              }`}
                            >
                              {friend.username?.[0]?.toUpperCase() || "F"}
                            </div>
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                                isOnline
                                  ? isDarkMode
                                    ? "bg-green-400 border-slate-800"
                                    : "bg-green-400 border-white"
                                  : isDarkMode
                                    ? "bg-slate-600 border-slate-800"
                                    : "bg-slate-400 border-white"
                              }`}
                            />
                          </div>

                          <div className="flex-1">
                            <h3
                              className={`font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
                            >
                              {friend.username}
                            </h3>
                            <p
                              className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                            >
                              Rating: {friend.rating || 1000}
                            </p>
                            <p
                              className={`text-xs ${isOnline ? (isDarkMode ? "text-green-400" : "text-green-600") : isDarkMode ? "text-slate-500" : "text-slate-500"}`}
                            >
                              {isOnline ? "● Online" : "● Offline"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleChallengeFriend(friend)}
                            disabled={
                              loading ||
                              !isOnline ||
                              challengingFriendId === friend.userId
                            }
                            className={`px-4 py-2 rounded-lg font-semibold transition text-sm w-full sm:w-auto ${
                              !isOnline || loading
                                ? isDarkMode
                                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                : isDarkMode
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                          >
                            {challengingFriendId === friend.userId
                              ? "Challenging..."
                              : "Challenge"}
                          </button>
                          <button
                            onClick={() => handleRemoveFriend(friend.userId)}
                            disabled={loading}
                            className={`px-4 py-2 rounded-lg font-semibold transition text-sm w-full sm:w-auto ${
                              isDarkMode
                                ? "bg-red-900/50 hover:bg-red-800/70 text-red-200"
                                : "bg-red-100 hover:bg-red-200 text-red-700"
                            }`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-8">
            <button
              onClick={() => navigate("/dashboard")}
              className={`btn-secondary w-full sm:w-auto ${isDarkMode ? "dark" : ""}`}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Game Mode Selection Modal */}
      <GameModeModal
        isOpen={isGameModeModalOpen}
        onClose={() => {
          setIsGameModeModalOpen(false);
          setSelectedFriendForChallenge(null);
        }}
        onSelect={handleGameModeSelected}
        friendName={selectedFriendForChallenge?.username || ""}
      />
    </div>
  );
}
