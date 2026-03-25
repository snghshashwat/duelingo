const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 1000,
  },
  wins: {
    type: Number,
    default: 0,
  },
  losses: {
    type: Number,
    default: 0,
  },
  totalMatches: {
    type: Number,
    default: 0,
  },
  matchHistory: [
    {
      matchId: mongoose.Schema.Types.ObjectId,
      opponentId: mongoose.Schema.Types.ObjectId,
      opponentUsername: String,
      won: Boolean,
      isDraw: {
        type: Boolean,
        default: false,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  friends: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  pendingFriendRequests: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      requestedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  sentFriendRequests: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      sentAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  notifications: [
    {
      type: {
        type: String,
        enum: ["friend_request", "challenge", "friend_accepted"],
      },
      fromUserId: mongoose.Schema.Types.ObjectId,
      fromUsername: String,
      message: String,
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  draws: {
    type: Number,
    default: 0,
  },
  avatarUrl: {
    type: String,
    default: "",
  },
  isOAuthUser: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    default: "",
    maxlength: 240,
  },
  nativeLanguage: {
    type: String,
    default: "English",
  },
  learningLanguage: {
    type: String,
    default: "Italian",
  },
  country: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
