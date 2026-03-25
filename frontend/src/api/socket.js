import io from "socket.io-client";

let socket = null;

export const initializeSocket = (userId, username) => {
  if (socket) {
    if (socket.connected) {
      socket.emit("user_connected", { userId, username });
    } else {
      socket.connect();
    }
    return socket;
  }

  const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5051";

  socket = io(socketUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✓ Connected to server");
    socket.emit("user_connected", { userId, username });
  });

  socket.on("disconnect", () => {
    console.log("✗ Disconnected from server");
  });

  return socket;
};

export const getSocket = () => socket;

export const findMatch = (userId, username, gameType) => {
  if (socket) {
    socket.emit("find_match", { userId, username, gameType });
  }
};

export const submitAnswer = (matchId, userId, answer) => {
  if (socket) {
    socket.emit("submit_answer", { matchId, userId, answer });
  }
};

export const submitPairAttempt = (
  matchId,
  userId,
  englishWord,
  italianWord,
) => {
  if (socket) {
    socket.emit("pairs_attempt", { matchId, userId, englishWord, italianWord });
  }
};

export const challengeFriend = (
  fromUserId,
  toUserId,
  fromUsername,
  gameType,
) => {
  if (socket) {
    socket.emit("challenge_friend", {
      fromUserId,
      toUserId,
      fromUsername,
      gameType,
    });
  }
};

export const respondToChallenge = (
  accepted,
  fromUserId,
  toUserId,
  gameType,
) => {
  if (socket) {
    socket.emit("challenge_response", {
      accepted,
      fromUserId,
      toUserId,
      gameType,
    });
  }
};

export const onMatchFound = (callback) => {
  if (socket) {
    socket.on("match_found", callback);
  }
};

export const onQuestionSent = (callback) => {
  if (socket) {
    socket.on("question_sent", callback);
  }
};

export const onMatchCountdown = (callback) => {
  if (socket) {
    socket.on("match_countdown", callback);
  }
};

export const onQuizStarted = (callback) => {
  if (socket) {
    socket.on("quiz_started", callback);
  }
};

export const onPairsStarted = (callback) => {
  if (socket) {
    socket.on("pairs_started", callback);
  }
};

export const onPairsRoundSent = (callback) => {
  if (socket) {
    socket.on("pairs_round_sent", callback);
  }
};

export const onPairsAttemptResult = (callback) => {
  if (socket) {
    socket.on("pairs_attempt_result", callback);
  }
};

export const onScoreUpdate = (callback) => {
  if (socket) {
    socket.on("score_update", callback);
  }
};

export const onAnswerFeedback = (callback) => {
  if (socket) {
    socket.on("answer_feedback", callback);
  }
};

export const onMatchResult = (callback) => {
  if (socket) {
    socket.on("match_result", callback);
  }
};

export const onWaitingForOpponent = (callback) => {
  if (socket) {
    socket.on("waiting_for_opponent", callback);
  }
};

export const onChallengeReceived = (callback) => {
  if (socket) {
    socket.on("challenge_received", callback);
  }
};

export const onChallengeSent = (callback) => {
  if (socket) {
    socket.on("challenge_sent", callback);
  }
};

export const onChallengeDeclined = (callback) => {
  if (socket) {
    socket.on("challenge_declined", callback);
  }
};

export const onChallengeAccepted = (callback) => {
  if (socket) {
    socket.on("challenge_accepted", callback);
  }
};

export const onChallengeError = (callback) => {
  if (socket) {
    socket.on("challenge_error", callback);
  }
};

export const onMatchAborted = (callback) => {
  if (socket) {
    socket.on("match_aborted", callback);
  }
};

export const offAll = () => {
  if (socket) {
    socket.off("match_found");
    socket.off("question_sent");
    socket.off("match_countdown");
    socket.off("quiz_started");
    socket.off("pairs_started");
    socket.off("pairs_round_sent");
    socket.off("pairs_attempt_result");
    socket.off("score_update");
    socket.off("answer_feedback");
    socket.off("match_result");
    socket.off("match_aborted");
    socket.off("waiting_for_opponent");
    socket.off("challenge_received");
    socket.off("challenge_sent");
    socket.off("challenge_accepted");
    socket.off("challenge_declined");
    socket.off("challenge_error");
  }
};
