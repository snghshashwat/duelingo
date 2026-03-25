const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  player1: {
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    score: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        timeSpent: Number, // in milliseconds
      },
    ],
  },
  player2: {
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    score: {
      type: Number,
      default: 0,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        answer: String,
        isCorrect: Boolean,
        timeSpent: Number,
      },
    ],
  },
  winner: mongoose.Schema.Types.ObjectId,
  questions: [mongoose.Schema.Types.ObjectId],
  status: {
    type: String,
    enum: ["waiting", "in_progress", "completed"],
    default: "waiting",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
});

module.exports = mongoose.model("Match", matchSchema);
