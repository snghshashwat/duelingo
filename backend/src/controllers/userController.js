const User = require("../models/User");
const Match = require("../models/Match");
const gameManager = require("../websocket/gameManager");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      rating: user.rating,
      wins: user.wins,
      losses: user.losses,
      totalMatches: user.totalMatches,
      matchHistory: user.matchHistory,
      friends: user.friends,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      nativeLanguage: user.nativeLanguage,
      learningLanguage: user.learningLanguage,
      country: user.country,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const leaderboard = await User.find()
      .sort({ rating: -1 })
      .limit(limit)
      .select("username rating wins losses totalMatches");

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActivePlayers = async (req, res) => {
  try {
    const onlineUserIds = gameManager.getOnlineUserIds();

    if (!onlineUserIds.length) {
      return res.json([]);
    }

    const activePlayers = await User.find({
      _id: { $in: onlineUserIds },
    })
      .select("_id username rating avatarUrl")
      .sort({ rating: -1 })
      .limit(50);

    return res.json(activePlayers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("friends");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.friends || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addFriend = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: "Username is required" });
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const friendUser = await User.findOne({ username: username.trim() });
    if (!friendUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (friendUser._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ error: "You cannot add yourself" });
    }

    const alreadyFriends = (currentUser.friends || []).some(
      (f) => f.userId.toString() === friendUser._id.toString(),
    );

    if (alreadyFriends) {
      return res.status(400).json({ error: "Already friends" });
    }

    const alreadyRequested = (currentUser.sentFriendRequests || []).some(
      (r) => r.userId.toString() === friendUser._id.toString(),
    );

    if (alreadyRequested) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Add sent request to currentUser
    currentUser.sentFriendRequests = currentUser.sentFriendRequests || [];
    currentUser.sentFriendRequests.push({
      userId: friendUser._id,
      username: friendUser.username,
    });

    // Add pending request to friendUser
    friendUser.pendingFriendRequests = friendUser.pendingFriendRequests || [];
    friendUser.pendingFriendRequests.push({
      userId: currentUser._id,
      username: currentUser.username,
    });

    // Add notification
    friendUser.notifications = friendUser.notifications || [];
    friendUser.notifications.push({
      type: "friend_request",
      fromUserId: currentUser._id,
      fromUsername: currentUser.username,
      message: `${currentUser.username} sent you a friend request`,
      read: false,
    });

    await currentUser.save();
    await friendUser.save();

    res.status(201).json({
      message: "Friend request sent",
      request: {
        userId: friendUser._id,
        username: friendUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriendPresence = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("friends");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const onlineUserIds = new Set(gameManager.getOnlineUserIds());
    const onlineFriendIds = (user.friends || [])
      .map((friend) => friend.userId.toString())
      .filter((friendId) => onlineUserIds.has(friendId));

    res.json({ onlineFriendIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { bio, avatarUrl, nativeLanguage, learningLanguage, country } =
      req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (typeof bio === "string") {
      user.bio = bio.slice(0, 240);
    }
    if (typeof avatarUrl === "string") {
      user.avatarUrl = avatarUrl.slice(0, 500);
    }
    if (typeof nativeLanguage === "string") {
      user.nativeLanguage = nativeLanguage.slice(0, 60);
    }
    if (typeof learningLanguage === "string") {
      user.learningLanguage = learningLanguage.slice(0, 60);
    }
    if (typeof country === "string") {
      user.country = country.slice(0, 80);
    }

    await user.save();

    res.json({
      message: "Profile updated",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        rating: user.rating,
        wins: user.wins,
        losses: user.losses,
        totalMatches: user.totalMatches,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        nativeLanguage: user.nativeLanguage,
        learningLanguage: user.learningLanguage,
        country: user.country,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Friend request endpoints
const getPendingFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      "pendingFriendRequests",
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.pendingFriendRequests || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSentFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("sentFriendRequests");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user.sentFriendRequests || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptFriendRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;

    if (!fromUserId) {
      return res.status(400).json({ error: "fromUserId is required" });
    }

    const currentUser = await User.findById(req.userId);
    const fromUser = await User.findById(fromUserId);

    if (!currentUser || !fromUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from pending requests
    currentUser.pendingFriendRequests = (
      currentUser.pendingFriendRequests || []
    ).filter((r) => r.userId.toString() !== fromUserId.toString());

    // Remove from sent requests
    fromUser.sentFriendRequests = (fromUser.sentFriendRequests || []).filter(
      (r) => r.userId.toString() !== req.userId.toString(),
    );

    // Add to friends
    currentUser.friends = currentUser.friends || [];
    fromUser.friends = fromUser.friends || [];

    currentUser.friends.push({
      userId: fromUser._id,
      username: fromUser.username,
    });

    fromUser.friends.push({
      userId: currentUser._id,
      username: currentUser.username,
    });

    // Add notification to fromUser
    fromUser.notifications = fromUser.notifications || [];
    fromUser.notifications.push({
      type: "friend_accepted",
      fromUserId: currentUser._id,
      fromUsername: currentUser.username,
      message: `${currentUser.username} accepted your friend request`,
      read: false,
    });

    await currentUser.save();
    await fromUser.save();

    res.json({
      message: "Friend request accepted",
      friend: {
        userId: fromUser._id,
        username: fromUser.username,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const declineFriendRequest = async (req, res) => {
  try {
    const { fromUserId } = req.body;

    if (!fromUserId) {
      return res.status(400).json({ error: "fromUserId is required" });
    }

    const currentUser = await User.findById(req.userId);
    const fromUser = await User.findById(fromUserId);

    if (!currentUser || !fromUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from pending requests
    currentUser.pendingFriendRequests = (
      currentUser.pendingFriendRequests || []
    ).filter((r) => r.userId.toString() !== fromUserId.toString());

    // Remove from sent requests
    fromUser.sentFriendRequests = (fromUser.sentFriendRequests || []).filter(
      (r) => r.userId.toString() !== req.userId.toString(),
    );

    await currentUser.save();
    await fromUser.save();

    res.json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const revokeFriendRequest = async (req, res) => {
  try {
    const { toUserId } = req.body;

    if (!toUserId) {
      return res.status(400).json({ error: "toUserId is required" });
    }

    const currentUser = await User.findById(req.userId);
    const toUser = await User.findById(toUserId);

    if (!currentUser || !toUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from sent requests
    currentUser.sentFriendRequests = (
      currentUser.sentFriendRequests || []
    ).filter((r) => r.userId.toString() !== toUserId.toString());

    // Remove from pending requests
    toUser.pendingFriendRequests = (toUser.pendingFriendRequests || []).filter(
      (r) => r.userId.toString() !== req.userId.toString(),
    );

    // Remove notification
    toUser.notifications = (toUser.notifications || []).filter(
      (n) =>
        !(
          n.type === "friend_request" &&
          n.fromUserId.toString() === req.userId.toString()
        ),
    );

    await currentUser.save();
    await toUser.save();

    res.json({ message: "Friend request revoked" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Notification endpoints
const getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("notifications");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sort by most recent first
    const notifications = (user.notifications || []).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds = [] } = req.body || {};
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (Array.isArray(notificationIds) && notificationIds.length > 0) {
      const ids = new Set(notificationIds.map((id) => id.toString()));
      user.notifications = (user.notifications || []).map((n) => {
        if (ids.has(n._id.toString())) {
          return { ...n.toObject(), read: true };
        }
        return n;
      });
    } else {
      user.notifications = (user.notifications || []).map((n) => ({
        ...n.toObject(),
        read: true,
      }));
    }

    await user.save();
    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json([]);
    }

    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Search by username or email
    const results = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
      _id: { $ne: req.userId }, // Exclude self
    })
      .limit(20)
      .select("_id username email rating avatarUrl");

    // Add friend status for each result
    const friendIds = new Set(
      (currentUser.friends || []).map((f) => f.userId.toString()),
    );
    const sentRequestIds = new Set(
      (currentUser.sentFriendRequests || []).map((r) => r.userId.toString()),
    );
    const pendingRequestIds = new Set(
      (currentUser.pendingFriendRequests || []).map((r) => r.userId.toString()),
    );

    const results_with_status = results.map((user) => ({
      ...user.toObject(),
      isFriend: friendIds.has(user._id.toString()),
      requestSent: sentRequestIds.has(user._id.toString()),
      requestReceived: pendingRequestIds.has(user._id.toString()),
    }));

    res.json(results_with_status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Match history endpoints
const getMatchHistory = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("matchHistory");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Sort by most recent first
    const history = (user.matchHistory || []).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getHeadToHeadStats = async (req, res) => {
  try {
    const { opponentId } = req.params;

    if (!opponentId) {
      return res.status(400).json({ error: "opponentId is required" });
    }

    const currentUser = await User.findById(req.userId);
    const opponent = await User.findById(opponentId);

    if (!currentUser || !opponent) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate stats
    const matches = (currentUser.matchHistory || []).filter(
      (m) => m.opponentId.toString() === opponentId.toString(),
    );

    const wins = matches.filter((m) => m.won && !m.isDraw).length;
    const losses = matches.filter((m) => !m.won && !m.isDraw).length;
    const draws = matches.filter((m) => m.isDraw).length;

    // Check friend status
    const isFriend = (currentUser.friends || []).some(
      (f) => f.userId.toString() === opponentId.toString(),
    );

    const requestSent = (currentUser.sentFriendRequests || []).some(
      (r) => r.userId.toString() === opponentId.toString(),
    );

    const requestReceived = (currentUser.pendingFriendRequests || []).some(
      (r) => r.userId.toString() === opponentId.toString(),
    );

    res.json({
      opponentId: opponent._id,
      opponentUsername: opponent.username,
      opponentRating: opponent.rating,
      opponentAvatar: opponent.avatarUrl,
      stats: {
        wins,
        losses,
        draws,
        total: wins + losses + draws,
      },
      isFriend,
      requestSent,
      requestReceived,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({ error: "friendId is required" });
    }

    const currentUser = await User.findById(req.userId);
    const friendUser = await User.findById(friendId);

    if (!currentUser || !friendUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Remove from friends
    currentUser.friends = (currentUser.friends || []).filter(
      (f) => f.userId.toString() !== friendId.toString(),
    );

    friendUser.friends = (friendUser.friends || []).filter(
      (f) => f.userId.toString() !== req.userId.toString(),
    );

    await currentUser.save();
    await friendUser.save();

    res.json({ message: "Friend removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
