import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { userAPI } from "../api/client";
import Navbar from "../components/Navbar";

export default function FriendRequestsPage() {
  const navigate = useNavigate();
  const { user, logout, isDarkMode } = useAuthStore();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "sent"

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadRequests();
  }, [user, navigate]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [pendingRes, sentRes] = await Promise.all([
        userAPI.getPendingFriendRequests(),
        userAPI.getSentFriendRequests(),
      ]);

      setPendingRequests(pendingRes.data || []);
      setSentRequests(sentRes.data || []);
      setMessage("");
    } catch (error) {
      setMessage("Failed to load friend requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (fromUserId) => {
    try {
      setLoading(true);
      await userAPI.acceptFriendRequest(fromUserId);
      setMessage("Friend request accepted!");
      loadRequests();
    } catch (error) {
      setMessage("Failed to accept friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (fromUserId) => {
    try {
      setLoading(true);
      await userAPI.declineFriendRequest(fromUserId);
      setMessage("Friend request declined");
      loadRequests();
    } catch (error) {
      setMessage("Failed to decline friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (toUserId) => {
    try {
      setLoading(true);
      await userAPI.revokeFriendRequest(toUserId);
      setMessage("Friend request revoked");
      loadRequests();
    } catch (error) {
      setMessage("Failed to revoke friend request");
    } finally {
      setLoading(false);
    }
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
                Friend Requests
              </h1>
              <button
                onClick={() => navigate("/friends")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  isDarkMode
                    ? "bg-blue-700 hover:bg-blue-600 text-blue-100"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                Back to Friends
              </button>
            </div>
            <p className={isDarkMode ? "text-slate-400" : "text-slate-600"}>
              Manage your friend requests
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("success") || message.includes("accepted")
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

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-3 font-semibold transition border-b-2 ${
                activeTab === "pending"
                  ? isDarkMode
                    ? "border-blue-500 text-blue-400"
                    : "border-emerald-600 text-emerald-700"
                  : isDarkMode
                    ? "border-transparent text-slate-400 hover:text-slate-300"
                    : "border-transparent text-slate-500 hover:text-slate-600"
              }`}
            >
              📥 Pending ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("sent")}
              className={`px-4 py-3 font-semibold transition border-b-2 ${
                activeTab === "sent"
                  ? isDarkMode
                    ? "border-blue-500 text-blue-400"
                    : "border-emerald-600 text-emerald-700"
                  : isDarkMode
                    ? "border-transparent text-slate-400 hover:text-slate-300"
                    : "border-transparent text-slate-500 hover:text-slate-600"
              }`}
            >
              📤 Sent ({sentRequests.length})
            </button>
          </div>

          {/* Pending Requests Tab */}
          {activeTab === "pending" && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div
                  className={`text-center py-8 rounded-lg  ${
                    isDarkMode
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  No pending friend requests
                </div>
              ) : (
                pendingRequests.map((request) => (
                  <div
                    key={request.userId}
                    className={`card flex items-center justify-between p-4 ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold text-lg ${
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        }`}
                      >
                        {request.username}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Sent{" "}
                        {new Date(request.requestedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(request.userId)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                          isDarkMode
                            ? "bg-green-700 hover:bg-green-600 text-green-100"
                            : "bg-green-600 hover:bg-green-700 text-white"
                        }`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecline(request.userId)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                          isDarkMode
                            ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
                            : "bg-slate-300 hover:bg-slate-400 text-slate-700"
                        }`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent Requests Tab */}
          {activeTab === "sent" && (
            <div className="space-y-3">
              {sentRequests.length === 0 ? (
                <div
                  className={`text-center py-8 rounded-lg ${
                    isDarkMode
                      ? "bg-slate-800 text-slate-400"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  No sent friend requests
                </div>
              ) : (
                sentRequests.map((request) => (
                  <div
                    key={request.userId}
                    className={`card flex items-center justify-between p-4 ${
                      isDarkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-semibold text-lg ${
                          isDarkMode ? "text-slate-100" : "text-slate-800"
                        }`}
                      >
                        {request.username}
                      </p>
                      <p
                        className={`text-sm ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Sent {new Date(request.sentAt).toLocaleDateString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevoke(request.userId)}
                      disabled={loading}
                      className={`px-4 py-2 rounded-lg font-semibold transition text-sm ${
                        isDarkMode
                          ? "bg-red-700/50 hover:bg-red-700 text-red-200"
                          : "bg-red-100 hover:bg-red-200 text-red-700"
                      }`}
                    >
                      Revoke
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
