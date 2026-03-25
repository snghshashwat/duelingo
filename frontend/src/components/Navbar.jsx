import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/gameStore";
import NotificationsDropdown from "./NotificationsDropdown";
import { Trophy, Users, LogOut, Sun, Moon, Menu, X } from "lucide-react";

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const { user, isDarkMode, toggleDarkMode } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userInitial = (user?.username || "U").charAt(0).toUpperCase();

  const goTo = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-40 ${
        isDarkMode
          ? "bg-slate-900/85 border-slate-700"
          : "bg-white/85 border-slate-200"
      } backdrop-blur-xl border-b transition-all duration-300`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 md:flex md:items-center md:justify-between md:gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center justify-between gap-3 md:justify-start">
          <div
            onClick={() => goTo("/")}
            className="text-2xl sm:text-3xl font-bold cursor-pointer flex items-center gap-3 hover:opacity-90 transition"
          >
            <img
              src="/logo.png"
              alt="Duelingo"
              className="h-11 w-11 sm:h-12 sm:w-12 rounded-md object-contain"
            />
            <span
              className={`${isDarkMode ? "text-blue-400" : "text-emerald-600"}`}
            >
              Duelingo
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`md:hidden px-3 py-2 rounded-lg border ${
              isDarkMode
                ? "border-slate-600 bg-slate-700 text-slate-100"
                : "border-slate-300 bg-white text-slate-700"
            }`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Desktop Navigation */}
        <div
          className={`hidden md:flex w-full md:w-auto items-center justify-end gap-2 sm:gap-3 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
        >
          <button
            onClick={() => goTo("/leaderboard")}
            className={`text-sm sm:text-base font-semibold px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-200 hover:text-cyan-300"
                : "hover:bg-slate-100 text-slate-700 hover:text-emerald-700"
            }`}
          >
            <Trophy size={20} />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => goTo("/friends")}
            className={`text-sm sm:text-base font-semibold px-3 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 ${
              isDarkMode
                ? "hover:bg-slate-800 text-slate-200 hover:text-cyan-300"
                : "hover:bg-slate-100 text-slate-700 hover:text-emerald-700"
            }`}
          >
            <Users size={20} />
            <span>Friends</span>
          </button>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Profile Section - Click together */}
          <button
            onClick={() => goTo("/profile")}
            title={user?.username}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:${
              isDarkMode ? "bg-slate-700" : "bg-slate-100"
            } transition-all duration-300`}
          >
            <div
              className={`h-8 w-8 rounded-full overflow-hidden ring-2 ${
                isDarkMode ? "ring-slate-600" : "ring-slate-300"
              }`}
              title={user?.username || "User"}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={`${user?.username || "User"} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className={`h-full w-full flex items-center justify-center text-sm font-bold ${
                    isDarkMode
                      ? "bg-blue-700 text-blue-100"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {userInitial}
                </div>
              )}
            </div>
            <span
              className={`max-w-[120px] break-all leading-tight text-sm sm:text-base ${isDarkMode ? "text-slate-200" : "text-slate-700"}`}
            >
              {user?.username}
            </span>
            <span
              className={`${isDarkMode ? "bg-blue-700/80 text-blue-100" : "bg-emerald-100 text-emerald-700"} px-2 sm:px-3 py-1 rounded text-xs sm:text-sm`}
            >
              {user?.rating || 1000}
            </span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`text-xl sm:text-2xl hover:opacity-80 transition-all duration-300 px-2 py-1 rounded-lg ${
              isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${
              isDarkMode
                ? "bg-red-900/50 hover:bg-red-800/70 text-red-200"
                : "bg-red-100 hover:bg-red-200 text-red-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LogOut size={16} />
              Logout
            </span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden mt-3 rounded-xl border p-3 space-y-2 ${
              isDarkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white"
            }`}
          >
            <button
              onClick={() => goTo("/leaderboard")}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-200"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <Trophy size={16} />
                Leaderboard
              </span>
            </button>
            <button
              onClick={() => goTo("/friends")}
              className={`w-full text-left px-3 py-2 rounded-lg ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-200"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="inline-flex items-center gap-2 font-semibold">
                <Users size={16} />
                Friends
              </span>
            </button>
            <button
              onClick={() => goTo("/profile")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg ${
                isDarkMode
                  ? "hover:bg-slate-700 text-slate-200"
                  : "hover:bg-slate-100 text-slate-700"
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <div
                  className={`h-7 w-7 rounded-full overflow-hidden ring-2 ${
                    isDarkMode ? "ring-slate-600" : "ring-slate-300"
                  }`}
                  title={user?.username || "User"}
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={`${user?.username || "User"} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-full w-full flex items-center justify-center text-xs font-bold ${
                        isDarkMode
                          ? "bg-blue-700 text-blue-100"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {userInitial}
                    </div>
                  )}
                </div>
                <span className="truncate">{user?.username}</span>
              </span>
              <span
                className={`${isDarkMode ? "bg-blue-700/80 text-blue-100" : "bg-emerald-100 text-emerald-700"} px-2 py-1 rounded text-xs`}
              >
                {user?.rating || 1000}
              </span>
            </button>
            <div className="flex gap-2 pt-1">
              <button
                onClick={toggleDarkMode}
                className={`flex-1 px-3 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-100"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                <span className="inline-flex items-center gap-2 font-semibold">
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  {isDarkMode ? "Light" : "Dark"}
                </span>
              </button>
              <button
                onClick={onLogout}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold ${
                  isDarkMode
                    ? "bg-red-900/50 text-red-200"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LogOut size={16} />
                  Logout
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
