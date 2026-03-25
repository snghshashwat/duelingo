import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useGameStore } from "../store/gameStore";
import {
  onMatchFound,
  onMatchCountdown,
  onQuizStarted,
  onPairsStarted,
  onQuestionSent,
  onPairsRoundSent,
  onPairsAttemptResult,
  onScoreUpdate,
  onMatchResult,
  onMatchAborted,
  onWaitingForOpponent,
  onChallengeDeclined,
  onChallengeError,
  submitAnswer,
  submitPairAttempt,
  offAll,
} from "../api/socket";

export default function GamePage() {
  const { user } = useAuthStore();
  const {
    matchId,
    setMatch,
    setQuestion,
    currentQuestion,
    currentQuestionIndex,
    gameType,
    scores,
    updateScores,
    setGameStatus,
    transitionCountdown,
    setTransitionCountdown,
    pendingMode,
    player1,
    player2,
    sprintTimeLeft,
    setSprintMeta,
    setSprintTimeLeft,
    pairsRound,
    totalPairsRounds,
    setPairsRound,
    matchedEnglish,
    matchedItalian,
    setPairsMatches,
  } = useGameStore();

  const [isWaiting, setIsWaiting] = useState(true);
  const [matchmakingError, setMatchmakingError] = useState("");
  const [selectedEnglish, setSelectedEnglish] = useState(null);
  const [selectedItalian, setSelectedItalian] = useState(null);
  const [lastAttemptFeedback, setLastAttemptFeedback] = useState("");
  const navigate = useNavigate();

  const isQuizMode = gameType === "QUIZ_SPRINT";
  const isPairsMode = gameType === "MATCH_PAIRS";

  const myScore = useMemo(() => {
    if (!user || !player1 || !player2) {
      return 0;
    }
    return user.id === String(player1.userId) ? scores.player1 : scores.player2;
  }, [scores, user, player1, player2]);

  useEffect(() => {
    onMatchFound((matchData) => {
      setGameStatus("matched");
      setMatch(matchData.matchId, matchData);
      setMatchmakingError("");
    });

    onMatchCountdown((data) => {
      setGameStatus("countdown");
      setTransitionCountdown(data.seconds);
    });

    onQuizStarted((data) => {
      setGameStatus("in_progress");
      setSprintMeta(data.durationSeconds, data.durationSeconds);
    });

    onPairsStarted(() => {
      setGameStatus("in_progress");
    });

    onQuestionSent((data) => {
      if (!data?.question) {
        setMatchmakingError("Unable to load questions for this match.");
        return;
      }

      setGameStatus("in_progress");
      setQuestion(data.question, data.questionIndex);
      setIsWaiting(false);
    });

    onPairsRoundSent((data) => {
      setGameStatus("in_progress");
      setPairsRound(data);
      setQuestion(data, data.roundNumber || 0);
      setPairsMatches(data.matchedEnglish || [], data.matchedItalian || []);
      setSelectedEnglish(null);
      setSelectedItalian(null);
      setLastAttemptFeedback("");
      setIsWaiting(false);
    });

    onPairsAttemptResult((data) => {
      setPairsMatches(data.matchedEnglish || [], data.matchedItalian || []);
      setLastAttemptFeedback(
        data.isCorrect ? "Correct match!" : "Wrong pair (-1)",
      );
    });

    onScoreUpdate((data) => {
      updateScores(data.player1Score, data.player2Score);
    });

    onMatchResult((result) => {
      navigate("/results", { state: { result } });
    });

    onMatchAborted((payload) => {
      setMatchmakingError(payload?.reason || "Match aborted");
    });

    onWaitingForOpponent(() => {
      setGameStatus("finding");
      setIsWaiting(true);
    });

    onChallengeDeclined(() => {
      setMatchmakingError("Your friend declined the challenge.");
      setIsWaiting(true);
    });

    onChallengeError((payload) => {
      setMatchmakingError(payload?.message || "Challenge failed");
      setIsWaiting(true);
    });

    return () => {
      offAll();
    };
  }, []);

  useEffect(() => {
    if (!transitionCountdown || transitionCountdown <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setTransitionCountdown(transitionCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [transitionCountdown, setTransitionCountdown]);

  useEffect(() => {
    if (!isQuizMode || sprintTimeLeft <= 0 || isWaiting) {
      return;
    }

    const timer = setTimeout(() => {
      setSprintTimeLeft(sprintTimeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isQuizMode, sprintTimeLeft, isWaiting, setSprintTimeLeft]);

  useEffect(() => {
    if (isPairsMode && selectedEnglish && selectedItalian && matchId && user) {
      submitPairAttempt(matchId, user.id, selectedEnglish, selectedItalian);
      setSelectedEnglish(null);
      setSelectedItalian(null);
    }
  }, [selectedEnglish, selectedItalian, isPairsMode, matchId, user]);

  const handleSubmitQuizAnswer = (answer) => {
    if (!matchId || !user) {
      return;
    }
    submitAnswer(matchId, user.id, answer);
  };

  if (isWaiting && !currentQuestion && !pairsRound) {
    return (
      <div className="flex items-center justify-center min-h-screen px-3 sm:px-4">
        <div className="card text-center max-w-xl w-full">
          {pendingMode === "friend" ? (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                Waiting for friend...
              </h1>
              <p className="text-slate-500 mb-6">
                Your challenge has been sent.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold mb-4">
                Finding opponent...
              </h1>
              <p className="text-slate-500 mb-6">
                Searching matchmaking queue.
              </p>
            </>
          )}

          {player1?.username && player2?.username && (
            <div className="mb-6">
              <p className="text-sm text-slate-500">Matched</p>
              <p className="text-base sm:text-xl font-semibold break-words">
                {player1.username} vs {player2.username}
              </p>
            </div>
          )}

          {transitionCountdown && transitionCountdown > 0 ? (
            <div className="text-5xl font-extrabold text-emerald-600 animate-pulse">
              {transitionCountdown}
            </div>
          ) : (
            <div className="animate-pulse flex justify-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
            </div>
          )}

          {transitionCountdown === 0 && (
            <p className="text-emerald-600 mt-4">Starting now...</p>
          )}

          <div className="mt-8">
            {matchmakingError && (
              <p className="text-red-500 mb-4">{matchmakingError}</p>
            )}
            <button className="btn-secondary" onClick={() => navigate("/")}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="card text-center">
            <p className="text-sm text-slate-500">Player 1</p>
            <p className="text-base sm:text-xl font-bold text-sky-600 break-words">
              {player1?.username}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-500">Score</p>
            <p className="text-xl font-bold">
              {scores.player1} - {scores.player2}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-500">Player 2</p>
            <p className="text-base sm:text-xl font-bold text-rose-600 break-words">
              {player2?.username}
            </p>
          </div>
          <div className="card text-center">
            <p className="text-sm text-slate-500">Mode</p>
            <p className="text-sm font-semibold">
              {isQuizMode ? "Quiz Sprint" : "Match the Following"}
            </p>
            {isQuizMode ? (
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                {sprintTimeLeft}s
              </p>
            ) : (
              <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                R{pairsRound || 1}/5
              </p>
            )}
          </div>
        </div>

        {isQuizMode && currentQuestion && (
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-500">
                Question #{currentQuestionIndex + 1}
              </p>
              <p className="text-slate-700 font-semibold">
                Your correct: {myScore}
              </p>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold mb-6">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleSubmitQuizAnswer(option)}
                  className="p-3 sm:p-4 text-sm sm:text-base rounded-lg font-semibold border border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-400 transition"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {isPairsMode && (
          <div className="card mb-6">
            <div className="flex flex-wrap justify-between gap-3 items-center mb-6">
              <p className="text-slate-500">
                Round {pairsRound || 1} of {totalPairsRounds}
              </p>
              <p className="text-slate-700 font-semibold">
                Your score: {myScore}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">English</h3>
                <div className="space-y-2">
                  {(currentQuestion?.englishWords || []).map((word) => {
                    const isMatched = matchedEnglish.includes(word);
                    const isSelected = selectedEnglish === word;
                    return (
                      <button
                        key={word}
                        disabled={isMatched}
                        onClick={() => setSelectedEnglish(word)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                          isMatched
                            ? "bg-emerald-100 border-emerald-200 text-emerald-700 cursor-not-allowed"
                            : isSelected
                              ? "bg-sky-100 border-sky-400"
                              : "bg-white border-slate-300 hover:bg-sky-50"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Italian</h3>
                <div className="space-y-2">
                  {(currentQuestion?.italianWords || []).map((word) => {
                    const isMatched = matchedItalian.includes(word);
                    const isSelected = selectedItalian === word;
                    return (
                      <button
                        key={word}
                        disabled={isMatched}
                        onClick={() => setSelectedItalian(word)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition ${
                          isMatched
                            ? "bg-violet-100 border-violet-200 text-violet-700 cursor-not-allowed"
                            : isSelected
                              ? "bg-amber-100 border-amber-400"
                              : "bg-white border-slate-300 hover:bg-amber-50"
                        }`}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <p className="text-sm mt-4 text-slate-500">
              Select one English word and one Italian word. Correct = +1, wrong
              = -1.
            </p>
            {lastAttemptFeedback && (
              <p
                className={`text-sm mt-2 ${
                  lastAttemptFeedback.includes("Correct")
                    ? "text-emerald-600"
                    : "text-red-500"
                }`}
              >
                {lastAttemptFeedback}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
