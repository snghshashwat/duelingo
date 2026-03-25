import React from "react";
import { useAuthStore } from "../store/gameStore";

export default function GameModeModal({
  isOpen,
  onClose,
  onSelect,
  friendName,
}) {
  const { isDarkMode } = useAuthStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`card max-w-md w-full ${isDarkMode ? "dark" : ""}`}>
        <h2
          className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-slate-100" : "text-slate-800"}`}
        >
          Choose Game Mode
        </h2>
        <p
          className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
        >
          Challenge {friendName} to:
        </p>

        <div className="space-y-3">
          {/* Quiz Sprint Mode */}
          <button
            onClick={() => {
              onSelect("QUIZ_SPRINT");
              onClose();
            }}
            className={`w-full p-4 rounded-lg border-2 transition text-left ${
              isDarkMode
                ? "border-blue-600 hover:bg-blue-900/40 hover:border-blue-500"
                : "border-blue-400 hover:bg-blue-50 hover:border-blue-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚡</div>
              <div>
                <h3
                  className={`font-bold text-lg ${isDarkMode ? "text-blue-300" : "text-blue-700"}`}
                >
                  Quiz Sprint
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Answer vocabulary questions as fast as possible. Test your
                  speed and accuracy!
                </p>
              </div>
            </div>
          </button>

          {/* Match Pairs Mode */}
          <button
            onClick={() => {
              onSelect("MATCH_PAIRS");
              onClose();
            }}
            className={`w-full p-4 rounded-lg border-2 transition text-left ${
              isDarkMode
                ? "border-emerald-600 hover:bg-emerald-900/40 hover:border-emerald-500"
                : "border-emerald-400 hover:bg-emerald-50 hover:border-emerald-500"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3
                  className={`font-bold text-lg ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}
                >
                  Match Pairs
                </h3>
                <p
                  className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Match vocabulary pairs correctly. Test your memory and pattern
                  recognition!
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          onClick={onClose}
          className={`w-full mt-6 px-4 py-2 rounded-lg font-semibold transition ${
            isDarkMode
              ? "bg-slate-700 hover:bg-slate-600 text-slate-200"
              : "bg-slate-200 hover:bg-slate-300 text-slate-800"
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
