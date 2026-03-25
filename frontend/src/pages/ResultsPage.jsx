import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useGameStore } from "../store/gameStore";
import { useAuthStore } from "../store/gameStore";

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const { resetGame } = useGameStore();
  const { user } = useAuthStore();

  const handlePlayAgain = () => {
    resetGame();
    navigate("/");
  };

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="card text-center">
          <p className="text-gray-400">No match result found</p>
          <button onClick={handlePlayAgain} className="btn-primary mt-4">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const myResult =
    String(result.player1.userId) === String(user?.id)
      ? result.player1
      : result.player2;

  return (
    <div className="flex items-center justify-center min-h-screen p-3 sm:p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-6">
          {myResult?.won ? (
            <h1 className="text-3xl sm:text-4xl font-bold text-emerald-600">
              You Won!
            </h1>
          ) : (
            <h1 className="text-3xl sm:text-4xl font-bold text-rose-600">
              You Lost
            </h1>
          )}
          {result.aborted && (
            <p className="text-sm text-slate-500 mt-2">
              Match aborted: {result.abortReason || "interrupted"}
            </p>
          )}
          <p className="text-sm text-slate-500 mt-2">
            Mode:{" "}
            {result.gameType === "MATCH_PAIRS"
              ? "Match the Following"
              : "Quiz Sprint"}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {/* Player 1 */}
          <div
            className={`p-6 rounded-lg border ${result.player1.won ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2 break-words">
              {result.player1.username}
            </h2>
            <p className="text-3xl font-bold mb-2">{result.player1.score}</p>
            {result.gameType === "QUIZ_SPRINT" && (
              <p className="text-sm text-slate-600">
                Correct: {result.player1.correctAnswers} / Attempts:{" "}
                {result.player1.attempts}
              </p>
            )}
            {result.gameType === "MATCH_PAIRS" && (
              <p className="text-sm text-slate-600">
                Solve time:{" "}
                {(result.player1.totalSolveTimeMs / 1000).toFixed(1)}s
              </p>
            )}
            <p className="text-sm text-slate-600">
              Rating: {result.player1.newRating}
            </p>
            <p
              className={`text-sm ${result.player1.won ? "text-emerald-700" : "text-slate-600"}`}
            >
              {result.player1.won ? "Winner" : "Loser"}
            </p>
          </div>

          {/* Player 2 */}
          <div
            className={`p-6 rounded-lg border ${result.player2.won ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}
          >
            <h2 className="text-lg sm:text-xl font-bold mb-2 break-words">
              {result.player2.username}
            </h2>
            <p className="text-3xl font-bold mb-2">{result.player2.score}</p>
            {result.gameType === "QUIZ_SPRINT" && (
              <p className="text-sm text-slate-600">
                Correct: {result.player2.correctAnswers} / Attempts:{" "}
                {result.player2.attempts}
              </p>
            )}
            {result.gameType === "MATCH_PAIRS" && (
              <p className="text-sm text-slate-600">
                Solve time:{" "}
                {(result.player2.totalSolveTimeMs / 1000).toFixed(1)}s
              </p>
            )}
            <p className="text-sm text-slate-600">
              Rating: {result.player2.newRating}
            </p>
            <p
              className={`text-sm ${result.player2.won ? "text-emerald-700" : "text-slate-600"}`}
            >
              {result.player2.won ? "Winner" : "Loser"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="btn-primary w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
          <button
            onClick={handlePlayAgain}
            className="btn-secondary w-full sm:w-auto"
          >
            Find Another Match
          </button>
        </div>
      </div>
    </div>
  );
}
