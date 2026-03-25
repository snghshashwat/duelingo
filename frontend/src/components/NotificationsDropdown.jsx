import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore } from "../store/gameStore";
import { userAPI } from "../api/client";
import { respondToChallenge } from "../api/socket";

export default function NotificationsDropdown() {
  const navigate = useNavigate();
  const { user, isDarkMode } = useAuthStore();
  const { setWaiting, setGameStatus, setPendingMode, setGameType } =
    useGameStore();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();

      // Load notifications every 10 seconds
      const interval = setInterval(loadNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const response = await userAPI.getNotifications();
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setNotifications(sorted);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const handleAcceptChallenge = async (notification) => {
    try {
      setLoading(true);
      setWaiting(true);
      setGameStatus("waiting");
      setPendingMode("friend");
      setGameType(notification.gameType);
      respondToChallenge(
        true,
        notification.fromUserId,
        user.id,
        notification.gameType,
      );
      await loadNotifications();
      setIsOpen(false);
      navigate("/game");
    } catch (error) {
      console.error("Failed to accept challenge:", error);
      setLoading(false);
    }
  };

  const handleAcceptFriendRequest = async (notification) => {
    try {
      setLoading(true);
      await userAPI.acceptFriendRequest(notification.fromUserId);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineFriendRequest = async (notification) => {
    try {
      setLoading(true);
      await userAPI.declineFriendRequest(notification.fromUserId);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to decline friend request:", error);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative px-3 py-2 rounded-lg flex items-center gap-2 transition ${
          isDarkMode
            ? "hover:bg-slate-700 text-slate-300"
            : "hover:bg-slate-100 text-slate-600"
        }`}
        title="Notifications"
      >
        <span className="text-lg sm:text-xl">🔔</span>
        {unreadCount > 0 && (
          <span
            className={`absolute top-1 right-1 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center ${
              isDarkMode ? "bg-red-600 text-white" : "bg-red-500 text-white"
            }`}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-96 max-h-96 rounded-xl border shadow-xl overflow-hidden z-50 ${
            isDarkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-slate-200"
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 border-b font-semibold flex justify-between items-center ${
              isDarkMode
                ? "bg-slate-700/50 border-slate-600 text-slate-200"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() =>
                  userAPI
                    .markNotificationsAsRead()
                    .then(() => loadNotifications())
                }
                className={`text-xs px-2 py-1 rounded ${
                  isDarkMode
                    ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                    : "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                }`}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div
                className={`px-4 py-8 text-center ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                No notifications
              </div>
            ) : (
              notifications.map((notification, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 border-b last:border-b-0 ${
                    !notification.read
                      ? isDarkMode
                        ? "bg-slate-700/30"
                        : "bg-blue-50"
                      : ""
                  } ${isDarkMode ? "border-slate-600" : "border-slate-100"}`}
                >
                  {/* Friend Request */}
                  {notification.type === "friend_request" && (
                    <div>
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        👥 Friend Request
                      </p>
                      <p
                        className={`text-sm mb-3 ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {notification.fromUsername} sent you a friend request
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleAcceptFriendRequest(notification)
                          }
                          disabled={loading}
                          className={`flex-1 px-3 py-1 rounded text-sm font-semibold transition ${
                            isDarkMode
                              ? "bg-green-700 hover:bg-green-600 text-green-100"
                              : "bg-green-600 hover:bg-green-700 text-white"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleDeclineFriendRequest(notification)
                          }
                          disabled={loading}
                          className={`flex-1 px-3 py-1 rounded text-sm font-semibold transition ${
                            isDarkMode
                              ? "bg-slate-600 hover:bg-slate-500 text-slate-100"
                              : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                          }`}
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Challenge */}
                  {notification.type === "challenge" && (
                    <div>
                      <p
                        className={`text-sm font-semibold mb-2 ${
                          isDarkMode ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        ⚔️ Challenge
                      </p>
                      <p
                        className={`text-sm mb-3 ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {notification.fromUsername} challenged you to a{" "}
                        {notification.gameType === "QUIZ_SPRINT"
                          ? "Quiz Sprint"
                          : "Match Pairs"}{" "}
                        match
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptChallenge(notification)}
                          disabled={loading}
                          className={`flex-1 px-3 py-1 rounded text-sm font-semibold transition ${
                            isDarkMode
                              ? "bg-purple-700 hover:bg-purple-600 text-purple-100"
                              : "bg-purple-600 hover:bg-purple-700 text-white"
                          }`}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => setIsOpen(false)}
                          className={`flex-1 px-3 py-1 rounded text-sm font-semibold transition ${
                            isDarkMode
                              ? "bg-slate-600 hover:bg-slate-500 text-slate-100"
                              : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                          }`}
                        >
                          Later
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Friend Accepted */}
                  {notification.type === "friend_accepted" && (
                    <div>
                      <p
                        className={`text-sm font-semibold mb-1 ${
                          isDarkMode ? "text-slate-200" : "text-slate-700"
                        }`}
                      >
                        ✓ Friend Accepted
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {notification.fromUsername} accepted your friend request
                      </p>
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-xs mt-2 ${
                      isDarkMode ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {new Date(notification.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
