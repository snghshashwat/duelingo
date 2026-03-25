import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isDarkMode: localStorage.getItem("isDarkMode") === "true",

  login: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),

  signup: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: true,
    }),

  logout: () =>
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    }),

  setUser: (user) =>
    set((state) => ({
      user,
      isAuthenticated: Boolean(
        user && (state.token || localStorage.getItem("user")),
      ),
    })),
  setToken: (token) =>
    set((state) => ({
      token,
      isAuthenticated: Boolean(
        (token || state.user) && (state.user || localStorage.getItem("user")),
      ),
    })),
  hydrateSession: (user, token) =>
    set({
      user,
      token,
      isAuthenticated: Boolean(user),
    }),
  toggleDarkMode: () =>
    set((state) => {
      const newMode = !state.isDarkMode;
      localStorage.setItem("isDarkMode", newMode);
      return { isDarkMode: newMode };
    }),
}));

export const useGameStore = create((set) => ({
  matchId: null,
  currentMatch: null,
  gameType: "QUIZ_SPRINT",
  currentQuestion: null,
  currentQuestionIndex: 0,
  sprintDurationSeconds: 60,
  sprintTimeLeft: 60,
  pairsRound: null,
  totalPairsRounds: 5,
  matchedEnglish: [],
  matchedItalian: [],
  player1: null,
  player2: null,
  scores: { player1: 0, player2: 0 },
  isWaiting: false,
  gameStatus: "idle", // idle, finding, matched, countdown, in_progress, completed
  transitionCountdown: null,
  pendingMode: "random", // random | friend

  setMatch: (matchId, match) =>
    set({
      matchId,
      currentMatch: match,
      gameType: match.gameType || "QUIZ_SPRINT",
      player1: match.player1,
      player2: match.player2,
      gameStatus: "matched",
    }),

  setQuestion: (question, index) =>
    set({
      currentQuestion: question,
      currentQuestionIndex: index,
    }),

  setSprintMeta: (durationSeconds, sprintTimeLeft) =>
    set({ sprintDurationSeconds: durationSeconds, sprintTimeLeft }),

  setSprintTimeLeft: (sprintTimeLeft) => set({ sprintTimeLeft }),

  setPairsRound: (pairsRoundData) =>
    set({
      pairsRound: pairsRoundData.roundNumber,
      totalPairsRounds: pairsRoundData.totalRounds,
      matchedEnglish: pairsRoundData.matchedEnglish || [],
      matchedItalian: pairsRoundData.matchedItalian || [],
    }),

  setPairsMatches: (matchedEnglish, matchedItalian) =>
    set({ matchedEnglish, matchedItalian }),

  updateScores: (player1Score, player2Score) =>
    set({
      scores: { player1: player1Score, player2: player2Score },
    }),

  setWaiting: (waiting) => set({ isWaiting: waiting }),

  setGameStatus: (status) => set({ gameStatus: status }),

  setTransitionCountdown: (seconds) => set({ transitionCountdown: seconds }),

  setPendingMode: (pendingMode) => set({ pendingMode }),

  setGameType: (gameType) => set({ gameType }),

  resetGame: () =>
    set({
      matchId: null,
      currentMatch: null,
      gameType: "QUIZ_SPRINT",
      currentQuestion: null,
      currentQuestionIndex: 0,
      sprintDurationSeconds: 60,
      sprintTimeLeft: 60,
      pairsRound: null,
      totalPairsRounds: 5,
      matchedEnglish: [],
      matchedItalian: [],
      scores: { player1: 0, player2: 0 },
      gameStatus: "idle",
      transitionCountdown: null,
      pendingMode: "random",
    }),
}));

export const useLeaderboardStore = create((set) => ({
  leaderboard: [],
  setLeaderboard: (data) => set({ leaderboard: data }),
}));
