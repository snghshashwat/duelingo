import React from "react";
import { useToastStore } from "../store/toastStore";
import { useAuthStore } from "../store/gameStore";

export default function ToastContainer() {
  const { toasts } = useToastStore();
  const { isDarkMode } = useAuthStore();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 p-4 pointer-events-none max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} isDarkMode={isDarkMode} />
      ))}
    </div>
  );
}

function Toast({ toast, isDarkMode }) {
  const { removeToast } = useToastStore();

  const bgColor = {
    success: isDarkMode
      ? "bg-emerald-900/90 border border-emerald-700"
      : "bg-emerald-100 border border-emerald-300",
    error: isDarkMode
      ? "bg-red-900/90 border border-red-700"
      : "bg-red-100 border border-red-300",
    info: isDarkMode
      ? "bg-blue-900/90 border border-blue-700"
      : "bg-blue-100 border border-blue-300",
    warning: isDarkMode
      ? "bg-amber-900/90 border border-amber-700"
      : "bg-amber-100 border border-amber-300",
  }[toast.type || "info"];

  const textColor = {
    success: isDarkMode ? "text-emerald-300" : "text-emerald-800",
    error: isDarkMode ? "text-red-300" : "text-red-800",
    info: isDarkMode ? "text-blue-300" : "text-blue-800",
    warning: isDarkMode ? "text-amber-300" : "text-amber-800",
  }[toast.type || "info"];

  const iconEmoji =
    {
      success: "✅",
      error: "❌",
      info: "ℹ️",
      warning: "⚠️",
      challenge: "⚔️",
      friend: "👥",
    }[toast.icon] || "💬";

  return (
    <div
      className={`${bgColor} ${textColor} rounded-lg p-4 shadow-lg pointer-events-auto flex items-start gap-3 animate-in slide-in-from-right-5 fade-in duration-300`}
    >
      <div className="text-xl flex-shrink-0">{iconEmoji}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
        <p className="text-sm break-words">{toast.message}</p>

        {Array.isArray(toast.actions) && toast.actions.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {toast.actions.map((action, idx) => (
              <button
                key={`${toast.id}-action-${idx}`}
                onClick={() => {
                  action.onClick?.();
                  if (action.closeOnClick !== false) {
                    removeToast(toast.id);
                  }
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                  action.variant === "danger"
                    ? isDarkMode
                      ? "bg-red-800 hover:bg-red-700 text-red-100"
                      : "bg-red-100 hover:bg-red-200 text-red-800"
                    : isDarkMode
                      ? "bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
                      : "bg-emerald-100 hover:bg-emerald-200 text-emerald-800"
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="flex-shrink-0 ml-2 text-xl hover:opacity-70 transition"
      >
        ✕
      </button>
    </div>
  );
}
