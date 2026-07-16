"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

// Helper to trigger theme class changes across components
function applyTheme(newTheme: "light" | "dark") {
  const mainEl = document.querySelector("main.public-theme");
  if (mainEl) {
    if (newTheme === "dark") {
      mainEl.classList.add("dark");
    } else {
      mainEl.classList.remove("dark");
    }
  }
  // Dispatch custom event so other toggles stay in sync
  window.dispatchEvent(new CustomEvent("tt_theme_change", { detail: newTheme }));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("tt_theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && systemDark) ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);

    const handleSync = (e: Event) => {
      setTheme((e as CustomEvent).detail);
    };
    window.addEventListener("tt_theme_change", handleSync);
    return () => window.removeEventListener("tt_theme_change", handleSync);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("tt_theme", next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black bg-white text-black shadow-[3px_3px_0px_0px_#000] hover:scale-110 active:scale-95 transition-all duration-300 dark-mode-toggle-btn"
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} className="text-[#00FF66]" />}
    </button>
  );
}

export function HeaderThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("tt_theme");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = saved === "dark" || (!saved && systemDark) ? "dark" : "light";
    setTheme(initial);

    const handleSync = (e: Event) => {
      setTheme((e as CustomEvent).detail);
    };
    window.addEventListener("tt_theme_change", handleSync);
    return () => window.removeEventListener("tt_theme_change", handleSync);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("tt_theme", next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme mode"
      className="hidden md:flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-white text-black hover:bg-[#00FF66] transition shadow-[2px_2px_0px_0px_#000000] dark-mode-toggle-btn mr-3"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} className="text-[#00FF66]" />}
    </button>
  );
}
