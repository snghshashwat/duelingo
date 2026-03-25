const Match = require("../models/Match");
const User = require("../models/User");
const {
  getRandomQuestions,
  getQuestionsByLanguageDirection,
} = require("../utils/questionHelper");
const { updateRatings } = require("../utils/elo");

const LANGUAGE_CODE_MAP = {
  english: "EN",
  italian: "IT",
};

const resolveQuestionDirection = (nativeLanguage, learningLanguage) => {
  const nativeCode =
    LANGUAGE_CODE_MAP[String(nativeLanguage || "").toLowerCase()];
  const learningCode =
    LANGUAGE_CODE_MAP[String(learningLanguage || "").toLowerCase()];

  if (nativeCode && learningCode) {
    return `${nativeCode}_${learningCode}`;
  }

  // Keep gameplay available when profile languages are unsupported.
  return "EN_IT";
};

const GAME_TYPES = {
  QUIZ_SPRINT: "QUIZ_SPRINT",
  MATCH_PAIRS: "MATCH_PAIRS",
};

const PAIR_BANK = [
  { en: "hello", it: "ciao" },
  { en: "water", it: "acqua" },
  { en: "house", it: "casa" },
  { en: "sun", it: "sole" },
  { en: "moon", it: "luna" },
  { en: "bread", it: "pane" },
  { en: "milk", it: "latte" },
  { en: "friend", it: "amico" },
  { en: "love", it: "amore" },
  { en: "night", it: "notte" },
  { en: "day", it: "giorno" },
  { en: "car", it: "macchina" },
  { en: "book", it: "libro" },
  { en: "school", it: "scuola" },
  { en: "cat", it: "gatto" },
  { en: "dog", it: "cane" },
  { en: "happy", it: "felice" },
  { en: "blue", it: "blu" },
  { en: "green", it: "verde" },
  { en: "red", it: "rosso" },
  { en: "family", it: "famiglia" },
  { en: "work", it: "lavoro" },
  { en: "city", it: "citta" },
  { en: "music", it: "musica" },
  { en: "food", it: "cibo" },
  { en: "time", it: "tempo" },
  { en: "window", it: "finestra" },
  { en: "door", it: "porta" },
  { en: "sea", it: "mare" },
  { en: "mountain", it: "montagna" },
];

const shuffle = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

class GameManager {
  constructor() {
    this.matchQueue = new Map(); // userId -> { socketId, userId, username, gameType }
    this.activeMatches = new Map(); // matchId -> match state
    this.userMatches = new Map(); // userId -> matchId
    this.onlineUsers = new Map(); // userId -> { socketId, username, userId }
  }

  registerOnlineUser(userId, username, socketId) {
    if (!userId || !socketId) {
      return;
    }
    this.onlineUsers.set(userId.toString(), { socketId, username, userId });
  }

  unregisterOnlineUser(userId) {
    if (!userId) {
      return;
    }
    this.onlineUsers.delete(userId.toString());
  }

  getOnlineUser(userId) {
    if (!userId) {
      return null;
    }
    return this.onlineUsers.get(userId.toString()) || null;
  }

  getOnlineUserIds() {
    return Array.from(this.onlineUsers.keys());
  }

  buildPairsRounds(
    totalRounds = 5,
    pairsPerRound = 5,
    nativeLanguage = "English",
    learningLanguage = "Italian",
  ) {
    // For now, we'll use a placeholder that returns pairs in the correct language direction
    // In production, you would have language-specific pair banks or a dynamic word pair generator
    const sample = shuffle(PAIR_BANK).slice(0, totalRounds * pairsPerRound);
    const rounds = [];

    for (let i = 0; i < totalRounds; i += 1) {
      const chunk = sample.slice(i * pairsPerRound, (i + 1) * pairsPerRound);
      // Map pairs based on direction (nativeLanguage -> learningLanguage)
      const nativeWords = chunk.map((p) =>
        nativeLanguage === "English" ? p.en : p.it,
      );
      const learningWords = shuffle(
        chunk.map((p) => (learningLanguage === "Italian" ? p.it : p.en)),
      );
      const mapping = chunk.reduce((acc, curr) => {
        const key = nativeLanguage === "English" ? curr.en : curr.it;
        const value = learningLanguage === "Italian" ? curr.it : curr.en;
        acc[key] = value;
        return acc;
      }, {});

      rounds.push({
        roundNumber: i + 1,
        nativeWords,
        learningWords,
        // Keep both naming styles to avoid empty rounds in consumers.
        englishWords: nativeWords,
        italianWords: learningWords,
        mapping,
      });
    }

    return rounds;
  }

  async createMatch(
    player1SocketId,
    player1UserId,
    player1Username,
    player2SocketId,
    player2UserId,
    player2Username,
    gameType = GAME_TYPES.QUIZ_SPRINT,
    player1Languages = {},
    player2Languages = {},
  ) {
    try {
      const effectiveGameType = Object.values(GAME_TYPES).includes(gameType)
        ? gameType
        : GAME_TYPES.QUIZ_SPRINT;

      // Use same learning language for both players (they're matched on it)
      const learningLanguage = player1Languages.learningLanguage || "Italian";
      const player1Native = player1Languages.nativeLanguage || "English";
      const player2Native = player2Languages.nativeLanguage || "English";

      // Get questions for the language direction (use learning language with English as fallback)
      // This will support EN→IT, EN→FR, EN→ES, EN→DE combinations
      const direction = resolveQuestionDirection(
        player1Native,
        learningLanguage,
      );
      let questionPool = await getQuestionsByLanguageDirection(direction, 40);

      if (!Array.isArray(questionPool) || questionPool.length === 0) {
        questionPool = await getRandomQuestions(40);
      }

      if (!Array.isArray(questionPool) || questionPool.length === 0) {
        throw new Error("No questions available to start match");
      }

      const questionIds = questionPool.map((q) => q._id);
      const pairsRounds = this.buildPairsRounds(
        5,
        5,
        player1Native,
        learningLanguage,
      );

      const match = new Match({
        player1: {
          userId: player1UserId,
          username: player1Username,
        },
        player2: {
          userId: player2UserId,
          username: player2Username,
        },
        questions: questionIds,
        status: "in_progress",
      });

      await match.save();

      const now = Date.now();
      this.activeMatches.set(match._id.toString(), {
        id: match._id.toString(),
        gameType: effectiveGameType,
        player1: {
          socketId: player1SocketId,
          userId: player1UserId,
          username: player1Username,
          score: 0,
          correctAnswers: 0,
          attempts: 0,
          questionCursor: 0,
          lastActiveAt: now,
          // Match pairs stats
          currentRound: 1,
          matchedEnglish: new Set(),
          matchedItalian: new Set(),
          roundStartedAt: null,
          totalSolveTimeMs: 0,
          completedAt: null,
        },
        player2: {
          socketId: player2SocketId,
          userId: player2UserId,
          username: player2Username,
          score: 0,
          correctAnswers: 0,
          attempts: 0,
          questionCursor: 0,
          lastActiveAt: now,
          currentRound: 1,
          matchedEnglish: new Set(),
          matchedItalian: new Set(),
          roundStartedAt: null,
          totalSolveTimeMs: 0,
          completedAt: null,
        },
        questionPool,
        pairsRounds,
        sprintStartedAt: null,
        sprintEndsAt: null,
        matchDB: match,
      });

      this.userMatches.set(player1UserId.toString(), match._id.toString());
      this.userMatches.set(player2UserId.toString(), match._id.toString());

      return {
        matchId: match._id.toString(),
        gameType: effectiveGameType,
        player1: {
          userId: player1UserId,
          username: player1Username,
        },
        player2: {
          userId: player2UserId,
          username: player2Username,
        },
      };
    } catch (error) {
      console.error("Error creating match:", error);
      throw error;
    }
  }

  getMatch(matchId) {
    return this.activeMatches.get(matchId);
  }

  getAllActiveMatches() {
    return Array.from(this.activeMatches.values());
  }

  getMatchByUserId(userId) {
    if (!userId) {
      return null;
    }
    const matchId = this.userMatches.get(userId.toString());
    if (!matchId) return null;
    return this.activeMatches.get(matchId);
  }

  touchPlayerActivity(matchId, userId) {
    const match = this.getMatch(matchId);
    if (!match || !userId) {
      return;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;
    player.lastActiveAt = Date.now();
  }

  getInactivePlayer(matchId, inactivityMs = 20000) {
    const match = this.getMatch(matchId);
    if (!match) {
      return null;
    }

    const now = Date.now();
    if (now - match.player1.lastActiveAt > inactivityMs) {
      return match.player1;
    }
    if (now - match.player2.lastActiveAt > inactivityMs) {
      return match.player2;
    }
    return null;
  }

  getNextQuestionForPlayer(matchId, userId) {
    const match = this.getMatch(matchId);
    if (!match || !userId || match.gameType !== GAME_TYPES.QUIZ_SPRINT) {
      return null;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;

    if (!match.questionPool.length) {
      return null;
    }

    const index = player.questionCursor % match.questionPool.length;
    const question = match.questionPool[index];

    return {
      questionIndex: player.questionCursor,
      question: {
        id: question._id,
        question: question.question,
        options: question.options,
      },
    };
  }

  submitSprintAnswer(matchId, userId, answer) {
    const match = this.getMatch(matchId);
    if (!match || match.gameType !== GAME_TYPES.QUIZ_SPRINT) {
      return null;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;

    const question =
      match.questionPool[player.questionCursor % match.questionPool.length];
    if (!question) {
      return null;
    }

    player.attempts += 1;
    const isCorrect =
      String(answer || "")
        .toLowerCase()
        .trim() === String(question.correctAnswer).toLowerCase().trim();

    if (isCorrect) {
      player.correctAnswers += 1;
      player.score += 1;
    }

    player.questionCursor += 1;
    player.lastActiveAt = Date.now();

    return {
      isCorrect,
      player1Score: match.player1.score,
      player2Score: match.player2.score,
      player1Correct: match.player1.correctAnswers,
      player2Correct: match.player2.correctAnswers,
      player1Attempts: match.player1.attempts,
      player2Attempts: match.player2.attempts,
      nextQuestion: this.getNextQuestionForPlayer(matchId, userId),
    };
  }

  startPairsForPlayer(matchId, userId) {
    const match = this.getMatch(matchId);
    if (!match || match.gameType !== GAME_TYPES.MATCH_PAIRS) {
      return null;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;
    player.roundStartedAt = Date.now();
    player.lastActiveAt = Date.now();

    return this.getPairsRoundForPlayer(matchId, userId);
  }

  getPairsRoundForPlayer(matchId, userId) {
    const match = this.getMatch(matchId);
    if (!match || match.gameType !== GAME_TYPES.MATCH_PAIRS) {
      return null;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;

    if (player.currentRound > match.pairsRounds.length) {
      return null;
    }

    const round = match.pairsRounds[player.currentRound - 1];
    return {
      roundNumber: player.currentRound,
      totalRounds: match.pairsRounds.length,
      englishWords: round.englishWords,
      italianWords: round.italianWords,
      matchedEnglish: Array.from(player.matchedEnglish),
      matchedItalian: Array.from(player.matchedItalian),
      playerScore: player.score,
    };
  }

  submitPairsAttempt(matchId, userId, englishWord, italianWord) {
    const match = this.getMatch(matchId);
    if (!match || match.gameType !== GAME_TYPES.MATCH_PAIRS) {
      return null;
    }

    const isPlayer1 = match.player1.userId.toString() === userId.toString();
    const player = isPlayer1 ? match.player1 : match.player2;

    if (player.currentRound > match.pairsRounds.length) {
      return { finished: true };
    }

    const round = match.pairsRounds[player.currentRound - 1];
    const expectedItalian = round.mapping[englishWord];

    player.lastActiveAt = Date.now();

    if (
      player.matchedEnglish.has(englishWord) ||
      player.matchedItalian.has(italianWord)
    ) {
      return {
        isCorrect: false,
        reason: "word_already_matched",
        playerScore: player.score,
        matchedEnglish: Array.from(player.matchedEnglish),
        matchedItalian: Array.from(player.matchedItalian),
      };
    }

    const isCorrect = expectedItalian && expectedItalian === italianWord;
    if (isCorrect) {
      player.matchedEnglish.add(englishWord);
      player.matchedItalian.add(italianWord);
      player.score += 1;
    } else {
      player.score -= 1;
    }

    let roundCompleted = false;
    let matchFinished = false;

    if (player.matchedEnglish.size === round.englishWords.length) {
      roundCompleted = true;
      if (player.roundStartedAt) {
        player.totalSolveTimeMs += Date.now() - player.roundStartedAt;
      }

      player.currentRound += 1;
      player.matchedEnglish = new Set();
      player.matchedItalian = new Set();
      player.roundStartedAt = Date.now();

      if (player.currentRound > match.pairsRounds.length) {
        matchFinished = true;
        player.completedAt = Date.now();
      }
    }

    return {
      isCorrect,
      playerScore: player.score,
      roundCompleted,
      matchFinished,
      roundPayload: this.getPairsRoundForPlayer(matchId, userId),
      player1Score: match.player1.score,
      player2Score: match.player2.score,
      player1Round: match.player1.currentRound,
      player2Round: match.player2.currentRound,
    };
  }

  areBothPlayersDonePairs(matchId) {
    const match = this.getMatch(matchId);
    if (!match || match.gameType !== GAME_TYPES.MATCH_PAIRS) {
      return false;
    }

    return (
      match.player1.currentRound > match.pairsRounds.length &&
      match.player2.currentRound > match.pairsRounds.length
    );
  }

  async endMatch(matchId, options = {}) {
    const match = this.getMatch(matchId);
    if (!match) return null;

    const { aborted = false, reason = null, winnerUserId = null } = options;

    let player1Won = false;
    let isDraw = false;

    if (aborted) {
      if (winnerUserId) {
        player1Won =
          match.player1.userId.toString() === winnerUserId.toString();
      }
    } else if (match.gameType === GAME_TYPES.MATCH_PAIRS) {
      if (
        match.player1.totalSolveTimeMs === match.player2.totalSolveTimeMs &&
        match.player1.score === match.player2.score
      ) {
        isDraw = true;
      } else if (
        match.player1.totalSolveTimeMs === match.player2.totalSolveTimeMs
      ) {
        player1Won = match.player1.score >= match.player2.score;
      } else {
        player1Won =
          match.player1.totalSolveTimeMs < match.player2.totalSolveTimeMs;
      }
    } else {
      // QUIZ_SPRINT
      if (match.player1.correctAnswers === match.player2.correctAnswers) {
        if (match.player1.attempts === match.player2.attempts) {
          isDraw = true;
        } else {
          player1Won = match.player1.attempts >= match.player2.attempts;
        }
      } else {
        player1Won =
          match.player1.correctAnswers > match.player2.correctAnswers;
      }
    }

    match.matchDB.player1.score = match.player1.score;
    match.matchDB.player2.score = match.player2.score;
    if (!isDraw) {
      match.matchDB.winner = player1Won
        ? match.player1.userId
        : match.player2.userId;
    }
    match.matchDB.status = aborted ? "completed" : "completed";
    match.matchDB.completedAt = new Date();
    await match.matchDB.save();

    const user1 = await User.findById(match.player1.userId);
    const user2 = await User.findById(match.player2.userId);

    if (!user1 || !user2) {
      this.activeMatches.delete(matchId);
      this.userMatches.delete(match.player1.userId.toString());
      this.userMatches.delete(match.player2.userId.toString());
      return null;
    }

    let newRating1 = user1.rating;
    let newRating2 = user2.rating;

    if (!isDraw) {
      const { newRating1: nr1, newRating2: nr2 } = updateRatings(
        user1.rating,
        user2.rating,
        player1Won,
      );
      newRating1 = nr1;
      newRating2 = nr2;

      user1.rating = newRating1;
      user2.rating = newRating2;
      user1.totalMatches += 1;
      user2.totalMatches += 1;

      if (player1Won) {
        user1.wins += 1;
        user2.losses += 1;
      } else {
        user1.losses += 1;
        user2.wins += 1;
      }
    } else {
      // Draw handling
      user1.totalMatches += 1;
      user2.totalMatches += 1;
      user1.draws = (user1.draws || 0) + 1;
      user2.draws = (user2.draws || 0) + 1;
    }

    user1.matchHistory.push({
      matchId: match.matchDB._id,
      opponentId: user2._id,
      opponentUsername: user2.username,
      won: !isDraw && player1Won,
      isDraw,
      timestamp: new Date(),
    });
    user2.matchHistory.push({
      matchId: match.matchDB._id,
      opponentId: user1._id,
      opponentUsername: user1.username,
      won: !isDraw && !player1Won,
      isDraw,
      timestamp: new Date(),
    });

    await user1.save();
    await user2.save();

    const result = {
      matchId,
      gameType: match.gameType,
      aborted,
      abortReason: reason,
      isDraw,
      player1: {
        userId: match.player1.userId,
        username: match.player1.username,
        score: match.player1.score,
        correctAnswers: match.player1.correctAnswers,
        attempts: match.player1.attempts,
        totalSolveTimeMs: match.player1.totalSolveTimeMs,
        newRating: newRating1,
        won: !isDraw && player1Won,
      },
      player2: {
        userId: match.player2.userId,
        username: match.player2.username,
        score: match.player2.score,
        correctAnswers: match.player2.correctAnswers,
        attempts: match.player2.attempts,
        totalSolveTimeMs: match.player2.totalSolveTimeMs,
        newRating: newRating2,
        won: !isDraw && !player1Won,
      },
    };

    this.activeMatches.delete(matchId);
    this.userMatches.delete(match.player1.userId.toString());
    this.userMatches.delete(match.player2.userId.toString());

    return result;
  }

  addToQueue(
    socketId,
    userId,
    username,
    gameType = GAME_TYPES.QUIZ_SPRINT,
    languages = {},
  ) {
    if (!userId) {
      return;
    }
    this.matchQueue.set(userId.toString(), {
      socketId,
      userId,
      username,
      gameType,
      languages: {
        nativeLanguage: languages.nativeLanguage || "English",
        learningLanguage: languages.learningLanguage || "Italian",
      },
    });
  }

  removeFromQueue(userId) {
    if (!userId) {
      return;
    }
    this.matchQueue.delete(userId.toString());
  }

  removeFromQueueBySocketId(socketId) {
    if (!socketId) {
      return;
    }
    for (const [queuedUserId, queuedUser] of this.matchQueue.entries()) {
      if (queuedUser.socketId === socketId) {
        this.matchQueue.delete(queuedUserId);
      }
    }
  }

  findMatch(
    userId,
    gameType = GAME_TYPES.QUIZ_SPRINT,
    learningLanguage = "Italian",
  ) {
    if (!userId) {
      return null;
    }

    const userArray = Array.from(this.matchQueue.values());
    const opponent = userArray.find(
      (u) =>
        u.userId.toString() !== userId.toString() &&
        u.gameType === gameType &&
        (u.languages?.learningLanguage || "Italian") === learningLanguage,
    );

    return opponent || null;
  }

  getQueueSize() {
    return this.matchQueue.size;
  }
}

module.exports = new GameManager();
module.exports.GAME_TYPES = GAME_TYPES;
