"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function TechnomaniaSciFiIntro({ onComplete }: { onComplete?: () => void }) {
  const [phase, setPhase] = useState<"scanning" | "locking" | "materializing" | "dissolving" | "complete">("scanning");
  const [glitchText, setGlitchText] = useState("INIT_PROTOCOL_TM3.0");
  const [coords, setCoords] = useState({ x: "30.7688° N", y: "76.5754° E" }); // Chandigarh University coordinates

  useEffect(() => {
    // Stage 1: Scanning & Telemetry (0 - 400ms)
    const t1 = setTimeout(() => setPhase("locking"), 400);
    // Stage 2: Aperture Lock & Shockwave (400 - 1100ms)
    const t2 = setTimeout(() => setPhase("materializing"), 1100);
    // Stage 3: Smooth Dissolve & Handover to Hero (1800ms)
    const t3 = setTimeout(() => setPhase("dissolving"), 1800);
    // Complete
    const t4 = setTimeout(() => {
      setPhase("complete");
      if (onComplete) onComplete();
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== "complete" && (
        <motion.div
          key="tm3-scifi-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === "dissolving" ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
        >
          {/* ── 1. Cyber Blueprint Grid & Radar Sweep ── */}
          <div className="absolute inset-0 tm-grid-bg opacity-40" />

          {/* Sci-Fi Vignette */}
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/60 to-black pointer-events-none" />

          {/* ── 2. Telemetry HUD Corners ── */}
          {/* Top Left: System Boot Status */}
          <div className="absolute top-6 left-6 font-mono text-[9px] text-zinc-500 tracking-[0.25em] space-y-1 hidden sm:block">
            <div className="flex items-center gap-2 text-zinc-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              <span>SYS_ONLINE // TM 3.0</span>
            </div>
            <div>SECTOR: GHARUAN // MOHALI</div>
            <div>GEO: {coords.x} | {coords.y}</div>
          </div>

          {/* Top Right: Frequency & Core */}
          <div className="absolute top-6 right-6 font-mono text-[9px] text-zinc-500 tracking-[0.25em] text-right space-y-1 hidden sm:block">
            <div className="text-zinc-400 font-bold">QUANTUM_BUS: 142.80 GHz</div>
            <div>SECURITY: BYPASS_AUTH</div>
            <div>STATUS: SYNCHRONIZED</div>
          </div>

          {/* Bottom Left: Festival Metrics */}
          <div className="absolute bottom-6 left-6 font-mono text-[9px] text-zinc-500 tracking-[0.25em] space-y-1 hidden sm:block">
            <div>24H HACKATHON // ESPORTS // CULTURAL</div>
            <div className="text-zinc-400">ORGANIZER: TECH TATVA OS</div>
          </div>

          {/* Bottom Right: Progress Segment */}
          <div className="absolute bottom-6 right-6 font-mono text-[9px] text-zinc-400 tracking-[0.25em] text-right hidden sm:block">
            <span>[ ■■■■■■■■■■■■■■■■ 100% ]</span>
          </div>

          {/* ── 3. Rotating Tech Aperture & Reticle Rings ── */}
          <motion.div
            initial={{ scale: 1.8, opacity: 0, rotate: 0 }}
            animate={{
              scale: phase === "scanning" ? [1.8, 1.2] : phase === "locking" ? [1.2, 0.95, 1.0] : 1.05,
              opacity: phase === "dissolving" ? 0 : [0, 0.6, 0.3],
              rotate: 360,
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.8 },
            }}
            className="absolute w-[360px] h-[360px] sm:w-[540px] sm:h-[540px] rounded-full border border-dashed border-zinc-700/60 pointer-events-none"
          />

          <motion.div
            initial={{ scale: 2.2, opacity: 0, rotate: 0 }}
            animate={{
              scale: phase === "scanning" ? [2.2, 1.4] : 1.0,
              opacity: phase === "dissolving" ? 0 : [0, 0.4, 0.2],
              rotate: -360,
            }}
            transition={{
              rotate: { duration: 25, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.4, ease: [0.16, 1, 0.3, 1] },
              opacity: { duration: 0.8 },
            }}
            className="absolute w-[440px] h-[440px] sm:w-[660px] sm:h-[660px] rounded-full border border-zinc-800 pointer-events-none"
          />

          {/* ── 4. Expanding Sci-Fi Shockwave Ring on Lock ── */}
          {phase !== "scanning" && (
            <motion.div
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute w-[300px] h-[300px] rounded-full border-2 border-white pointer-events-none shadow-[0_0_30px_rgba(255,255,255,0.8)]"
            />
          )}

          {/* ── 5. Corner Locking Brackets ── */}
          <motion.div
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{
              scale: phase === "scanning" ? 1.3 : 1.0,
              opacity: phase === "dissolving" ? 0 : 0.8,
            }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[320px] sm:w-[480px] md:w-[600px] aspect-[2.2/1] flex items-center justify-center p-6"
          >
            {/* Tech Corner Reticles */}
            <span className="absolute top-0 left-0 text-white font-mono text-sm">┌</span>
            <span className="absolute top-0 right-0 text-white font-mono text-sm">┐</span>
            <span className="absolute bottom-0 left-0 text-white font-mono text-sm">└</span>
            <span className="absolute bottom-0 right-0 text-white font-mono text-sm">┘</span>

            {/* Crosshair Line Tickers */}
            <div className="absolute top-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <div className="absolute bottom-0 inset-x-12 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

            {/* Laser Vertical Scanline */}
            <motion.div
              initial={{ top: "0%", opacity: 0 }}
              animate={{
                top: ["0%", "100%", "0%"],
                opacity: [0, 0.9, 0],
              }}
              transition={{
                duration: 1.4,
                repeat: 1,
                ease: "easeInOut",
              }}
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_15px_rgba(255,255,255,1)] pointer-events-none z-20"
            />

            {/* ── 6. THE CORE TM 3.0 EMBLEM MATERIALIZING ── */}
            <motion.div
              initial={{ scale: 0.3, opacity: 0, filter: "blur(18px)" }}
              animate={{
                scale: phase === "scanning" ? 0.6 : phase === "locking" ? [0.6, 1.15, 1.0] : 1.0,
                opacity: phase === "scanning" ? 0.4 : 1,
                filter: phase === "scanning" ? "blur(8px)" : "blur(0px)",
              }}
              transition={{
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative w-full h-full flex items-center justify-center will-change-transform transform-gpu"
            >
              <Image
                src="/technomania/logo-white.png"
                alt="Technomania 3.0"
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.7)]"
                priority
              />
            </motion.div>
          </motion.div>

          {/* ── 7. Target Lock Banner ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: phase === "dissolving" ? 0 : 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-6 flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800 text-[10px] font-mono tracking-[0.3em] text-zinc-300 uppercase"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>
              {phase === "scanning" && "TARGETING: TM-3.0_CORE..."}
              {phase === "locking" && "LOCK ACQUIRED // CALIBRATING"}
              {(phase === "materializing" || phase === "dissolving") && "ACCESS GRANTED // READY"}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
