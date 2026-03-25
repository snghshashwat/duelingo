import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import { authAPI, userAPI } from "../api/client";
import Navbar from "../components/Navbar";

const LANGUAGES = ["English", "Italian", "French", "Spanish", "German"];

export default function ProfilePage() {
  const { user, setUser, logout, isDarkMode } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileForm, setProfileForm] = useState({
    avatarUrl: user?.avatarUrl || "",
    bio: user?.bio || "",
    nativeLanguage: user?.nativeLanguage || "English",
    learningLanguage: user?.learningLanguage || "Italian",
    country: user?.country || "",
  });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage("");

    try {
      const response = await userAPI.updateProfile(profileForm);
      const updatedUser = {
        ...user,
        ...response.data.user,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setProfileMessage("Profile saved successfully.");
      setIsEditing(false);
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (error) {
      setProfileMessage(
        error.response?.data?.error || "Failed to save profile",
      );
    }
  };

  const handleCancel = () => {
    // Reset form to current user state
    setProfileForm({
      avatarUrl: user?.avatarUrl || "",
      bio: user?.bio || "",
      nativeLanguage: user?.nativeLanguage || "English",
      learningLanguage: user?.learningLanguage || "Italian",
      country: user?.country || "",
    });
    setIsEditing(false);
    setProfileMessage("");
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
    <>
      <Navbar onLogout={handleLogout} />

      <div
        className={`min-h-screen ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 to-slate-800"
            : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* User Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className={`card text-center ${isDarkMode ? "dark" : ""}`}>
              <h3
                className={`text-sm uppercase mb-2 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Rating
              </h3>
              <p
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-blue-400" : "text-emerald-600"
                }`}
              >
                {user?.rating || 1000}
              </p>
            </div>

            <div className={`card text-center ${isDarkMode ? "dark" : ""}`}>
              <h3
                className={`text-sm uppercase mb-2 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Wins
              </h3>
              <p
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-blue-400" : "text-blue-500"
                }`}
              >
                {user?.wins || 0}
              </p>
            </div>

            <div className={`card text-center ${isDarkMode ? "dark" : ""}`}>
              <h3
                className={`text-sm uppercase mb-2 ${
                  isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Losses
              </h3>
              <p
                className={`text-4xl font-bold ${
                  isDarkMode ? "text-red-400" : "text-red-500"
                }`}
              >
                {user?.losses || 0}
              </p>
            </div>
          </div>

          {/* Main Profile Card */}
          <div className="card mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <h2
                className={`text-2xl sm:text-3xl font-bold ${
                  isDarkMode ? "text-slate-100" : "text-slate-800"
                }`}
              >
                Profile
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary px-6 py-2 w-full sm:w-auto"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Message */}
            {profileMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  profileMessage.includes("success")
                    ? isDarkMode
                      ? "bg-green-900/40 text-green-300 border border-green-700"
                      : "bg-green-100 text-green-800 border border-green-300"
                    : isDarkMode
                      ? "bg-red-900/40 text-red-300 border border-red-700"
                      : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {profileMessage}
              </div>
            )}

            {isEditing ? (
              // EDIT MODE
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Avatar URL + Preview */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Avatar URL
                  </label>
                  <input
                    className="input-field"
                    value={profileForm.avatarUrl}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        avatarUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {profileForm.avatarUrl && (
                    <div className="mt-3 flex gap-4 items-center">
                      <span
                        className={`text-xs ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Preview:
                      </span>
                      <img
                        src={profileForm.avatarUrl}
                        alt="Avatar preview"
                        className="w-16 h-16 rounded-full object-cover"
                        onError={() => {}}
                      />
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Bio
                  </label>
                  <textarea
                    className={`input-field min-h-[100px] ${
                      isDarkMode ? "dark" : ""
                    }`}
                    value={profileForm.bio}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        bio: e.target.value,
                      }))
                    }
                    placeholder="Tell others about your language goals..."
                    maxLength={240}
                  />
                  <p
                    className={`text-xs mt-1 ${
                      isDarkMode ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {profileForm.bio.length}/240
                  </p>
                </div>

                {/* Languages */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Native Language
                    </label>
                    <select
                      className={`input-field ${isDarkMode ? "dark" : ""}`}
                      value={profileForm.nativeLanguage}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          nativeLanguage: e.target.value,
                        }))
                      }
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-semibold mb-2 ${
                        isDarkMode ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      Learning Language
                    </label>
                    <select
                      className={`input-field ${isDarkMode ? "dark" : ""}`}
                      value={profileForm.learningLanguage}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          learningLanguage: e.target.value,
                        }))
                      }
                    >
                      {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label
                    className={`block text-sm font-semibold mb-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Country
                  </label>
                  <input
                    className={`input-field ${isDarkMode ? "dark" : ""}`}
                    value={profileForm.country}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                    placeholder="e.g., United States"
                  />
                </div>

                {/* Account Info (Read-only) */}
                <div
                  className={`p-4 rounded-lg border ${
                    isDarkMode
                      ? "bg-slate-700/50 border-slate-600"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <p
                    className={`text-sm ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <span className="font-semibold">Username:</span> @
                    {user?.username}
                  </p>
                  <p
                    className={`text-sm mt-2 ${
                      isDarkMode ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <span className="font-semibold">Email:</span> {user?.email}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary px-6 py-2 w-full sm:w-auto"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`btn-primary px-6 py-2 w-full sm:w-auto ${isDarkMode ? "dark" : ""}`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              // VIEW MODE
              <div className="space-y-6">
                {/* Avatar Display */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt="User avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-emerald-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${
                        isDarkMode
                          ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white"
                      }`}
                    >
                      {user?.username[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <div>
                    <h1
                      className={`text-2xl font-bold ${
                        isDarkMode ? "text-slate-100" : "text-slate-800"
                      }`}
                    >
                      @{user?.username}
                    </h1>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Profile Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {profileForm.bio && (
                    <div className="md:col-span-2">
                      <h3
                        className={`text-sm font-semibold uppercase mb-2 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Bio
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                      >
                        {profileForm.bio}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3
                      className={`text-sm font-semibold uppercase mb-2 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Native Language
                    </h3>
                    <p
                      className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      {profileForm.nativeLanguage}
                    </p>
                  </div>

                  <div>
                    <h3
                      className={`text-sm font-semibold uppercase mb-2 ${
                        isDarkMode ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      Learning Language
                    </h3>
                    <p
                      className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                    >
                      {profileForm.learningLanguage}
                    </p>
                  </div>

                  {profileForm.country && (
                    <div>
                      <h3
                        className={`text-sm font-semibold uppercase mb-2 ${
                          isDarkMode ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        Country
                      </h3>
                      <p
                        className={`${isDarkMode ? "text-slate-300" : "text-slate-700"}`}
                      >
                        {profileForm.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => navigate("/dashboard")}
              className={`btn-secondary px-6 py-2 ${isDarkMode ? "dark" : ""}`}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
