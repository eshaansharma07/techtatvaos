"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function TechnomaniaIntro({ onComplete }: { onComplete?: () => void }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Cinematic timer: logo expands, settles, then fades out smoothly
    const timer = setTimeout(() => {
      setShow(false);
      if (onComplete) onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="tm3-intro-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* Subtle Ambient Radial Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.4, 0.15], scale: [0.8, 1.4, 1.2] }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] rounded-full bg-white/10 blur-[120px] pointer-events-none"
          />

          {/* Precision Center Coordinate Crosshair */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 1.4, times: [0, 0.5, 1] }}
            className="absolute font-mono text-[9px] text-zinc-500 tracking-[0.3em] uppercase -translate-y-28"
          >
            INITIALIZING // TECHNOMANIA 3.0
          </motion.div>

          {/* Expanding & Lodging TM 3.0 Logo */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, filter: "blur(14px)" }}
            animate={{
              scale: [0.4, 1.15, 1.0],
              opacity: [0, 1, 1],
              filter: ["blur(14px)", "blur(0px)", "blur(0px)"],
            }}
            transition={{
              duration: 1.4,
              times: [0, 0.65, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative w-[300px] sm:w-[460px] md:w-[560px] aspect-[2.4/1] flex items-center justify-center"
          >
            <Image
              src="/technomania/logo-white.png"
              alt="Technomania 3.0"
              fill
              className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.7)]"
              priority
            />
          </motion.div>

          {/* Bottom Loading Bar */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 140, opacity: [0, 1, 0] }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="h-[2px] bg-white mt-10 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
