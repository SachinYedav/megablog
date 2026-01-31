import React from "react";
import { Sun, Moon } from "lucide-react";
import useTheme from "../../context/ThemeContext";

export default function ThemeToggleBtn() {
  const { themeMode, lightTheme, darkTheme } = useTheme();

  const toggleTheme = () => {
    themeMode === "dark" ? lightTheme() : darkTheme();
  };

  return (
    <button
      onClick={toggleTheme}
      title="Toggle Theme"
      className={`
        relative inline-flex h-8 w-16 shrink-0 cursor-pointer
        rounded-full border-2 border-transparent
        transition-colors duration-300
        focus:outline-none shadow-inner
        ${themeMode === "dark" ? "bg-slate-700" : "bg-sky-200"}
      `}
    >
      <span className="sr-only">Toggle theme</span>

      <span
        className={`
          pointer-events-none absolute left-0 top-0.5
          h-7 w-7 rounded-full bg-white shadow-lg
          flex items-center justify-center
          transform transition-all duration-300
          ease-[cubic-bezier(0.25,1,0.3,1)]  /* Telegram-like */
          ${themeMode === "dark" ? "translate-x-8" : "translate-x-1"}
        `}
      >
        {/* ☀️ Sun */}
        <Sun
          size={15}
          className={`
            absolute transition-all duration-200
            ${
              themeMode === "dark"
                ? "opacity-0 rotate-90 scale-75"
                : "opacity-100 rotate-0 scale-100 text-orange-400 fill-orange-400"
            }
          `}
        />

        {/* 🌙 Moon */}
        <Moon
          size={15}
          className={`
            absolute transition-all duration-200
            ${
              themeMode === "dark"
                ? "opacity-100 rotate-0 scale-100 text-slate-700"
                : "opacity-0 -rotate-90 scale-75"
            }
          `}
        />
      </span>
    </button>
  );
}
