import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/gameStore";
import { authAPI, userAPI } from "./api/client";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";
import FriendRequestsPage from "./pages/FriendRequestsPage";
import MatchHistoryPage from "./pages/MatchHistoryPage";
import OpponentProfilePage from "./pages/OpponentProfilePage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ToastContainer from "./components/ToastContainer";
import NotificationListener from "./components/NotificationListener";
import "./index.css";

function App() {
  const { isAuthenticated, hydrateSession, logout, isDarkMode } =
    useAuthStore();

  useEffect(() => {
    const hydrate = async () => {
      const userRaw = localStorage.getItem("user");
      const onAuthCallback = window.location.pathname === "/auth-callback";

      if (!userRaw && !onAuthCallback) {
        return;
      }

      try {
        if (userRaw) {
          const localUser = JSON.parse(userRaw);
          hydrateSession(localUser, "cookie");
        }

        const meRes = await authAPI.me();
        const meUser = meRes.data.user;

        if (!meUser) {
          throw new Error("No active session");
        }

        localStorage.setItem("user", JSON.stringify(meUser));
        hydrateSession(meUser, "cookie");

        // Refresh profile from backend to keep session robust.
        const profileRes = await userAPI.getProfile();
        const serverUser = profileRes.data;
        const mergedUser = {
          id: serverUser.id,
          username: serverUser.username,
          email: serverUser.email,
          rating: serverUser.rating,
          wins: serverUser.wins,
          losses: serverUser.losses,
          totalMatches: serverUser.totalMatches,
          avatarUrl: serverUser.avatarUrl,
          bio: serverUser.bio,
          nativeLanguage: serverUser.nativeLanguage,
          learningLanguage: serverUser.learningLanguage,
          country: serverUser.country,
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));
        hydrateSession(mergedUser, "cookie");
      } catch (error) {
        localStorage.removeItem("user");
        logout();
      }
    };

    hydrate();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ToastContainer />
      <NotificationListener />
      <div
        className={`min-h-screen transition-colors duration-300 ${
          isDarkMode
            ? "dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-emerald-50"
        }`}
      >
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/auth-callback" element={<AuthCallbackPage />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          ) : (
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/friend-requests" element={<FriendRequestsPage />} />
              <Route path="/match-history" element={<MatchHistoryPage />} />
              <Route
                path="/opponent/:opponentId"
                element={<OpponentProfilePage />}
              />
              <Route path="/game" element={<GamePage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
