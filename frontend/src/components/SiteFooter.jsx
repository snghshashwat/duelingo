import React from "react";
import { useAuthStore } from "../store/gameStore";

export default function SiteFooter({ translucent = false }) {
  const { isDarkMode } = useAuthStore();

  return (
    <footer
      className={`w-full border-t px-4 py-4 text-center text-sm ${
        translucent
          ? "border-white/20 bg-black/25 text-slate-100 backdrop-blur"
          : isDarkMode
            ? "border-slate-700 bg-slate-900 text-slate-300"
            : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span>Made by </span>
      <span className="font-semibold">Shashwat Singh</span>
      <span> · </span>
      <a
        href="https://www.linkedin.com/in/shashwat-singh-57220420b/"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-emerald-400 underline-offset-4 hover:text-emerald-400"
      >
        LinkedIn
      </a>
    </footer>
  );
}
