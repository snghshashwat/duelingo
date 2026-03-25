import React, { useEffect, useState } from "react";
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
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const userRaw = localStorage.getItem("user");
      const onAuthCallback = window.location.pathname === "/auth-callback";

      if (!userRaw && !onAuthCallback) {
        setIsHydrating(false);
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
        const status = error?.response?.status;
        const isUnauthorized = status === 401 || status === 403;

        if (isUnauthorized) {
          localStorage.removeItem("user");
          logout();
        } else if (userRaw) {
          // Keep local session on temporary network/server issues.
          try {
            const localUser = JSON.parse(userRaw);
            hydrateSession(localUser, "cookie");
          } catch (_) {
            // Keep existing state if local data is malformed.
          }
        }
      } finally {
        setIsHydrating(false);
      }
    };

    hydrate();
  }, []);

  if (isHydrating) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode
            ? "dark bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-emerald-50"
        }`}
      >
        <div className="card text-center max-w-sm w-full">
          <p className="text-slate-500">Restoring your session...</p>
        </div>
      </div>
    );
  }

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
