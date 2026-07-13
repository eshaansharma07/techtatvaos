"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WORDS = [
  "room.",
  "phase.",
  "arena.",
  "system.",
  "future."
];

interface RotatingWordsProps {
  words?: string[];
}

export function RotatingWords({ words }: RotatingWordsProps) {
  const displayWords = words && words.length > 0 ? words : WORDS;
  const [index, setIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);

    return () => {
      mediaQuery.removeEventListener("change", listener);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % displayWords.length);
    }, 2800);

    return () => clearInterval(interval);
  }, [prefersReducedMotion, displayWords.length]);

  if (prefersReducedMotion) {
    return (
      <span 
        className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200"
        style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
      >
        {displayWords[0]}
      </span>
    );
  }

  return (
    <span className="inline-block">
      <AnimatePresence mode="wait">
        <motion.span
          key={displayWords[index]}
          initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-amber-200"
          style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
        >
          {displayWords[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
