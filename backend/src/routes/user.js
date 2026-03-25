const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  getProfile,
  getLeaderboard,
  getActivePlayers,
  getFriends,
  addFriend,
  getFriendPresence,
  updateProfile,
  getPendingFriendRequests,
  getSentFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  revokeFriendRequest,
  getNotifications,
  markNotificationsAsRead,
  searchUsers,
  getMatchHistory,
  getHeadToHeadStats,
  removeFriend,
} = require("../controllers/userController");
const {
  validateAddFriend,
  validateObjectIdBody,
  validateObjectIdParam,
  validateSearchQuery,
  validateUpdateProfile,
  validateMarkNotifications,
} = require("../middleware/validators");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validateUpdateProfile, updateProfile);
router.get("/leaderboard", getLeaderboard);
router.get("/active-players", authMiddleware, getActivePlayers);
router.get("/search", authMiddleware, validateSearchQuery, searchUsers);

// Friends
router.get("/friends", authMiddleware, getFriends);
router.get("/friends/presence", authMiddleware, getFriendPresence);
router.post("/friends/add", authMiddleware, validateAddFriend, addFriend);
router.delete(
  "/friends/:friendId",
  authMiddleware,
  validateObjectIdParam("friendId"),
  removeFriend,
);

// Friend Requests
router.get(
  "/friend-requests/pending",
  authMiddleware,
  getPendingFriendRequests,
);
router.get("/friend-requests/sent", authMiddleware, getSentFriendRequests);
router.post(
  "/friend-requests/accept",
  authMiddleware,
  validateObjectIdBody("fromUserId"),
  acceptFriendRequest,
);
router.post(
  "/friend-requests/decline",
  authMiddleware,
  validateObjectIdBody("fromUserId"),
  declineFriendRequest,
);
router.post(
  "/friend-requests/revoke",
  authMiddleware,
  validateObjectIdBody("toUserId"),
  revokeFriendRequest,
);

// Notifications
router.get("/notifications", authMiddleware, getNotifications);
router.post(
  "/notifications/read",
  authMiddleware,
  validateMarkNotifications,
  markNotificationsAsRead,
);

// Match History
router.get("/match-history", authMiddleware, getMatchHistory);
router.get(
  "/matches/head-to-head/:opponentId",
  authMiddleware,
  validateObjectIdParam("opponentId"),
  getHeadToHeadStats,
);

module.exports = router;
