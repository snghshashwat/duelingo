import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5051";

const createClient = () => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
  });

  return client;
};

const apiClient = createClient();

export const authAPI = {
  signup: (username, email, password, nativeLanguage, learningLanguage) =>
    apiClient.post("/auth/signup", {
      username,
      email,
      password,
      nativeLanguage,
      learningLanguage,
    }),

  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),

  me: () => apiClient.get("/auth/me"),

  logout: () => apiClient.post("/auth/logout"),
};

export const userAPI = {
  getProfile: () => apiClient.get("/user/profile"),

  updateProfile: (payload) => apiClient.put("/user/profile", payload),

  getLeaderboard: (limit = 20) =>
    apiClient.get(`/user/leaderboard?limit=${limit}`),
  getActivePlayers: () => apiClient.get("/user/active-players"),

  // Search
  searchUsers: (query) => apiClient.get("/user/search", { params: { query } }),

  // Friends
  getFriends: () => apiClient.get("/user/friends"),
  getFriendPresence: () => apiClient.get("/user/friends/presence"),
  addFriend: (username) => apiClient.post("/user/friends/add", { username }),
  removeFriend: (friendId) => apiClient.delete(`/user/friends/${friendId}`),

  // Friend Requests
  getPendingFriendRequests: () =>
    apiClient.get("/user/friend-requests/pending"),
  getSentFriendRequests: () => apiClient.get("/user/friend-requests/sent"),
  acceptFriendRequest: (fromUserId) =>
    apiClient.post("/user/friend-requests/accept", { fromUserId }),
  declineFriendRequest: (fromUserId) =>
    apiClient.post("/user/friend-requests/decline", { fromUserId }),
  revokeFriendRequest: (toUserId) =>
    apiClient.post("/user/friend-requests/revoke", { toUserId }),

  // Notifications
  getNotifications: () => apiClient.get("/user/notifications"),
  markNotificationsAsRead: (notificationIds = []) =>
    apiClient.post("/user/notifications/read", { notificationIds }),

  // Match History
  getMatchHistory: () => apiClient.get("/user/match-history"),
  getHeadToHeadStats: (opponentId) =>
    apiClient.get(`/user/matches/head-to-head/${opponentId}`),
};

export default apiClient;
