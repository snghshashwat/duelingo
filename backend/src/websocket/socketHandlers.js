const gameManager = require("./gameManager");
const { GAME_TYPES } = require("./gameManager");
const User = require("../models/User");

const MATCH_COUNTDOWN_SECONDS = 3;
const QUIZ_SPRINT_DURATION_SECONDS = 60;
const INACTIVITY_MS = 20000;

const isValidId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

const isValidShortString = (value, max = 64) =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= max;

const isValidGameType = (gameType) =>
  gameType === GAME_TYPES.QUIZ_SPRINT || gameType === GAME_TYPES.MATCH_PAIRS;

const initializeSocket = (io) => {
  const inactivityWatchers = new Map();
  const sprintTimers = new Map();

  const clearMatchTimers = (matchId) => {
    const watcher = inactivityWatchers.get(matchId);
    if (watcher) {
      clearInterval(watcher);
      inactivityWatchers.delete(matchId);
    }

    const sprintTimer = sprintTimers.get(matchId);
    if (sprintTimer) {
      clearTimeout(sprintTimer);
      sprintTimers.delete(matchId);
    }
  };

  const emitAndFinalizeMatch = async (matchId, options = {}) => {
    const result = await gameManager.endMatch(matchId, options);
    if (result) {
      io.to(matchId).emit("match_result", result);
    }
    clearMatchTimers(matchId);
  };

  const startInactivityWatcher = (matchId) => {
    clearMatchTimers(matchId);

    const watcher = setInterval(async () => {
      const match = gameManager.getMatch(matchId);
      if (!match) {
        clearMatchTimers(matchId);
        return;
      }

      const inactivePlayer = gameManager.getInactivePlayer(
        matchId,
        INACTIVITY_MS,
      );
      if (!inactivePlayer) {
        return;
      }

      const winnerUserId =
        inactivePlayer.userId.toString() === match.player1.userId.toString()
          ? match.player2.userId
          : match.player1.userId;

      io.to(matchId).emit("match_aborted", {
        reason: `${inactivePlayer.username} was inactive for 20s`,
      });

      await emitAndFinalizeMatch(matchId, {
        aborted: true,
        reason: "inactive_timeout",
        winnerUserId,
      });
    }, 2000);

    inactivityWatchers.set(matchId, watcher);
  };

  const startMatchFlow = (matchData) => {
    const match = gameManager.getMatch(matchData.matchId);
    if (!match) {
      return;
    }

    io.to(matchData.matchId).emit("match_countdown", {
      seconds: MATCH_COUNTDOWN_SECONDS,
      gameType: matchData.gameType,
    });

    setTimeout(() => {
      const latestMatch = gameManager.getMatch(matchData.matchId);
      if (!latestMatch) {
        return;
      }

      if (latestMatch.gameType === GAME_TYPES.QUIZ_SPRINT) {
        latestMatch.sprintStartedAt = Date.now();
        latestMatch.sprintEndsAt =
          Date.now() + QUIZ_SPRINT_DURATION_SECONDS * 1000;

        io.to(matchData.matchId).emit("quiz_started", {
          durationSeconds: QUIZ_SPRINT_DURATION_SECONDS,
        });

        const player1Question = gameManager.getNextQuestionForPlayer(
          matchData.matchId,
          latestMatch.player1.userId,
        );
        const player2Question = gameManager.getNextQuestionForPlayer(
          matchData.matchId,
          latestMatch.player2.userId,
        );

        if (!player1Question?.question || !player2Question?.question) {
          io.to(matchData.matchId).emit("match_aborted", {
            reason: "Unable to load questions for this match",
          });
          return;
        }

        io.to(latestMatch.player1.socketId).emit(
          "question_sent",
          player1Question,
        );
        io.to(latestMatch.player2.socketId).emit(
          "question_sent",
          player2Question,
        );

        const sprintTimer = setTimeout(async () => {
          await emitAndFinalizeMatch(matchData.matchId);
        }, QUIZ_SPRINT_DURATION_SECONDS * 1000);

        sprintTimers.set(matchData.matchId, sprintTimer);
      } else {
        io.to(matchData.matchId).emit("pairs_started", { totalRounds: 5 });

        const player1Round = gameManager.startPairsForPlayer(
          matchData.matchId,
          latestMatch.player1.userId,
        );
        const player2Round = gameManager.startPairsForPlayer(
          matchData.matchId,
          latestMatch.player2.userId,
        );

        io.to(latestMatch.player1.socketId).emit(
          "pairs_round_sent",
          player1Round,
        );
        io.to(latestMatch.player2.socketId).emit(
          "pairs_round_sent",
          player2Round,
        );
      }
    }, MATCH_COUNTDOWN_SECONDS * 1000);

    startInactivityWatcher(matchData.matchId);
  };

  const createAndStartMatch = async ({
    player1Socket,
    player2Socket,
    player1UserId,
    player1Username,
    player1Languages,
    player2UserId,
    player2Username,
    player2Languages,
    gameType,
  }) => {
    const matchData = await gameManager.createMatch(
      player1Socket.id,
      player1UserId,
      player1Username,
      player2Socket.id,
      player2UserId,
      player2Username,
      gameType,
      player1Languages,
      player2Languages,
    );

    player1Socket.join(matchData.matchId);
    player2Socket.join(matchData.matchId);

    player1Socket.emit("match_found", matchData);
    player2Socket.emit("match_found", matchData);

    startMatchFlow(matchData);
  };

  io.on("connection", (socket) => {
    console.log(`✓ User connected: ${socket.id}`);

    socket.on("user_connected", (data) => {
      if (!isValidId(data?.userId) || !isValidShortString(data?.username, 32)) {
        socket.emit("challenge_error", {
          message: "Invalid user connection payload",
        });
        return;
      }

      socket.userId = data.userId;
      socket.username = data.username;
      gameManager.registerOnlineUser(data.userId, data.username, socket.id);
      console.log(
        `✓ ${data.username} (${data.userId}) is ready for matchmaking`,
      );
    });

    socket.on("find_match", async (data) => {
      const { userId, username, gameType = GAME_TYPES.QUIZ_SPRINT } = data;

      if (
        !isValidId(userId) ||
        !isValidShortString(username, 32) ||
        !isValidGameType(gameType)
      ) {
        socket.emit("challenge_error", {
          message: "Invalid matchmaking payload",
        });
        return;
      }

      if (
        !socket.userId ||
        socket.userId.toString() !== userId.toString() ||
        socket.username !== username
      ) {
        socket.emit("challenge_error", {
          message: "Unauthorized matchmaking request",
        });
        return;
      }

      // Fetch user to get language preferences
      let nativeLanguage = "English";
      let learningLanguage = "Italian";
      try {
        const user = await User.findById(userId).select(
          "nativeLanguage learningLanguage",
        );
        if (user) {
          nativeLanguage = user.nativeLanguage || "English";
          learningLanguage = user.learningLanguage || "Italian";
        }
      } catch (error) {
        console.error("Error fetching user language preferences:", error);
      }

      gameManager.addToQueue(socket.id, userId, username, gameType, {
        nativeLanguage,
        learningLanguage,
      });
      const opponent = gameManager.findMatch(
        userId,
        gameType,
        learningLanguage,
      );

      if (!opponent) {
        socket.emit("waiting_for_opponent", {
          message: "Waiting for opponent...",
        });
        return;
      }

      gameManager.removeFromQueue(userId);
      gameManager.removeFromQueue(opponent.userId);

      const opponentSocket = io.sockets.sockets.get(opponent.socketId);
      if (!opponentSocket) {
        socket.emit("waiting_for_opponent", {
          message: "Opponent disconnected. Waiting for another opponent...",
        });
        return;
      }

      try {
        await createAndStartMatch({
          player1Socket: socket,
          player2Socket: opponentSocket,
          player1UserId: userId,
          player1Username: username,
          player1Languages: { nativeLanguage, learningLanguage },
          player2UserId: opponent.userId,
          player2Username: opponent.username,
          player2Languages: opponent.languages,
          gameType,
        });
      } catch (error) {
        socket.emit("challenge_error", { message: error.message });
      }
    });

    socket.on("challenge_friend", async (data) => {
      try {
        const {
          fromUserId,
          toUserId,
          fromUsername,
          gameType = GAME_TYPES.QUIZ_SPRINT,
        } = data;

        if (!isValidGameType(gameType)) {
          socket.emit("challenge_error", {
            message: "Invalid game type",
          });
          return;
        }

        if (
          !isValidId(fromUserId) ||
          !isValidId(toUserId) ||
          !isValidShortString(fromUsername, 32)
        ) {
          socket.emit("challenge_error", {
            message: "Invalid challenge payload",
          });
          return;
        }

        if (
          !socket.userId ||
          socket.userId.toString() !== fromUserId.toString()
        ) {
          socket.emit("challenge_error", {
            message: "Unauthorized challenge request",
          });
          return;
        }

        if (!fromUserId || !toUserId || fromUserId === toUserId) {
          socket.emit("challenge_error", {
            message: "Invalid challenge payload",
          });
          return;
        }

        const challenger = await User.findById(fromUserId);
        const challenged = await User.findById(toUserId);

        if (!challenger || !challenged) {
          socket.emit("challenge_error", {
            message: "User not found",
          });
          return;
        }

        const isFriend = (challenger?.friends || []).some(
          (friend) => friend.userId.toString() === toUserId.toString(),
        );

        if (!isFriend) {
          socket.emit("challenge_error", {
            message: "You can only challenge users in your friends list",
          });
          return;
        }

        // Add notification to challenged user
        challenged.notifications = challenged.notifications || [];
        challenged.notifications.push({
          type: "challenge",
          fromUserId: challenger._id,
          fromUsername: challenger.username,
          message: `${challenger.username} challenged you to a ${gameType} match`,
          read: false,
          gameType,
          createdAt: new Date(),
        });
        await challenged.save();

        // If target is online, emit real-time notification
        const targetOnlineUser = gameManager.getOnlineUser(toUserId);
        if (targetOnlineUser) {
          const targetSocket = io.sockets.sockets.get(
            targetOnlineUser.socketId,
          );
          targetSocket?.emit("challenge_received", {
            fromUserId,
            fromUsername,
            gameType,
          });
        }

        socket.emit("challenge_sent", {
          message: "Challenge sent successfully",
          toUserId,
          toUsername: challenged.username,
        });
      } catch (error) {
        socket.emit("challenge_error", { message: error.message });
      }
    });

    socket.on("challenge_response", async (data) => {
      try {
        const {
          accepted,
          fromUserId,
          toUserId,
          gameType = GAME_TYPES.QUIZ_SPRINT,
        } = data;

        if (
          typeof accepted !== "boolean" ||
          !isValidId(fromUserId) ||
          !isValidId(toUserId) ||
          !isValidGameType(gameType)
        ) {
          socket.emit("challenge_error", {
            message: "Invalid challenge response payload",
          });
          return;
        }

        if (
          !socket.userId ||
          socket.userId.toString() !== toUserId.toString()
        ) {
          socket.emit("challenge_error", {
            message: "Unauthorized challenge response",
          });
          return;
        }

        const challengerOnline = gameManager.getOnlineUser(fromUserId);
        const challengedOnline = gameManager.getOnlineUser(toUserId);

        const challengerSocket = challengerOnline
          ? io.sockets.sockets.get(challengerOnline.socketId)
          : null;

        if (!accepted) {
          challengerSocket?.emit("challenge_declined", { byUserId: toUserId });
          return;
        }

        if (!challengerOnline || !challengedOnline) {
          challengerSocket?.emit("challenge_error", {
            message: "One player went offline",
          });
          return;
        }

        const challengedSocket = io.sockets.sockets.get(
          challengedOnline.socketId,
        );
        if (!challengedSocket || !challengerSocket) {
          challengerSocket?.emit("challenge_error", {
            message: "One player went offline",
          });
          return;
        }

        challengerSocket.emit("challenge_accepted", {
          byUserId: toUserId,
          gameType,
        });

        gameManager.removeFromQueue(fromUserId);
        gameManager.removeFromQueue(toUserId);

        await createAndStartMatch({
          player1Socket: challengerSocket,
          player2Socket: challengedSocket,
          player1UserId: fromUserId,
          player1Username: challengerOnline.username,
          player2UserId: toUserId,
          player2Username: challengedOnline.username,
          gameType,
        });
      } catch (error) {
        socket.emit("challenge_error", { message: error.message });
      }
    });

    socket.on("submit_answer", async (data) => {
      const { matchId, userId, answer } = data;

      if (!isValidShortString(matchId, 64) || !isValidId(userId)) {
        return;
      }

      if (!isValidShortString(answer, 200)) {
        return;
      }

      if (!socket.userId || socket.userId.toString() !== userId.toString()) {
        return;
      }

      const match = gameManager.getMatch(matchId);

      if (!match || match.gameType !== GAME_TYPES.QUIZ_SPRINT) {
        return;
      }

      const now = Date.now();
      if (match.sprintEndsAt && now > match.sprintEndsAt) {
        return;
      }

      gameManager.touchPlayerActivity(matchId, userId);
      const result = gameManager.submitSprintAnswer(matchId, userId, answer);
      if (!result) {
        return;
      }

      io.to(matchId).emit("score_update", {
        gameType: match.gameType,
        player1Score: result.player1Score,
        player2Score: result.player2Score,
        player1Correct: result.player1Correct,
        player2Correct: result.player2Correct,
        player1Attempts: result.player1Attempts,
        player2Attempts: result.player2Attempts,
      });

      io.to(socket.id).emit("answer_feedback", {
        isCorrect: result.isCorrect,
        submittedAnswer: answer,
      });

      if (result.nextQuestion) {
        setTimeout(() => {
          io.to(socket.id).emit("question_sent", result.nextQuestion);
        }, 350);
      }
    });

    socket.on("pairs_attempt", async (data) => {
      const { matchId, userId, englishWord, italianWord } = data;

      if (!isValidShortString(matchId, 64) || !isValidId(userId)) {
        return;
      }

      if (
        !isValidShortString(englishWord, 80) ||
        !isValidShortString(italianWord, 80)
      ) {
        return;
      }

      if (!socket.userId || socket.userId.toString() !== userId.toString()) {
        return;
      }

      const match = gameManager.getMatch(matchId);

      if (!match || match.gameType !== GAME_TYPES.MATCH_PAIRS) {
        return;
      }

      gameManager.touchPlayerActivity(matchId, userId);
      const result = gameManager.submitPairsAttempt(
        matchId,
        userId,
        englishWord,
        italianWord,
      );

      if (!result) {
        return;
      }

      io.to(socket.id).emit("pairs_attempt_result", {
        isCorrect: result.isCorrect,
        reason: result.reason || null,
        matchedEnglish:
          result.matchedEnglish || result.roundPayload?.matchedEnglish || [],
        matchedItalian:
          result.matchedItalian || result.roundPayload?.matchedItalian || [],
      });

      io.to(matchId).emit("score_update", {
        gameType: match.gameType,
        player1Score: result.player1Score,
        player2Score: result.player2Score,
        player1Round: result.player1Round,
        player2Round: result.player2Round,
      });

      if (result.roundPayload) {
        io.to(socket.id).emit("pairs_round_sent", result.roundPayload);
      }

      if (gameManager.areBothPlayersDonePairs(matchId)) {
        await emitAndFinalizeMatch(matchId);
      }
    });

    socket.on("disconnect", async () => {
      console.log(`✗ User disconnected: ${socket.id}`);
      gameManager.removeFromQueueBySocketId(socket.id);

      if (socket.userId) {
        const activeMatch = gameManager.getMatchByUserId(socket.userId);

        if (activeMatch) {
          const winnerUserId =
            activeMatch.player1.userId.toString() === socket.userId.toString()
              ? activeMatch.player2.userId
              : activeMatch.player1.userId;

          io.to(activeMatch.id).emit("match_aborted", {
            reason: `${socket.username || "Opponent"} left the game`,
          });

          await emitAndFinalizeMatch(activeMatch.id, {
            aborted: true,
            reason: "player_disconnected",
            winnerUserId,
          });
        }

        gameManager.removeFromQueue(socket.userId);
        gameManager.unregisterOnlineUser(socket.userId);
      }
    });
  });
};

module.exports = initializeSocket;
