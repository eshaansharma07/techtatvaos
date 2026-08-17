"use client";

import React, { useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

interface DynamicMascotProps {
  type: "hackathon" | "esports" | "cultural" | "subevents" | string;
  isHovered?: boolean;
}

/**
 * Procedural Dynamic 3D Mascot with full physics, animated limbs/accessories,
 * holographic particles, and reactive cursor eye tracking.
 */
export function TechnomaniaDynamicMascot({ type, isHovered = false }: DynamicMascotProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Eye-tracking reactive springs
  const eyeX = useSpring(0, { stiffness: 300, damping: 25 });
  const eyeY = useSpring(0, { stiffness: 300, damping: 25 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    eyeX.set(xPct * 8);
    eyeY.set(yPct * 6);
  }

  function handleMouseLeave() {
    eyeX.set(0);
    eyeY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-black border border-zinc-800/80 group-hover:border-zinc-500 transition-all shadow-[0_0_30px_rgba(0,0,0,0.9)] group-hover:shadow-[0_0_35px_rgba(255,255,255,0.2)] flex items-center justify-center select-none"
    >
      {/* Sci-Fi Blueprint Matrix Grid */}
      <div className="absolute inset-0 tm-grid-bg opacity-30 pointer-events-none" />

      {/* Ambient Pulsing Backlight */}
      <motion.div
        animate={{
          scale: isHovered ? [1, 1.25, 1] : [1, 1.1, 1],
          opacity: isHovered ? [0.35, 0.6, 0.35] : [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-24 h-24 rounded-full bg-white blur-xl pointer-events-none"
      />

      {/* Floating Holographic Particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: (i - 2) * 18,
            y: 20 + i * 4,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            y: [-15, -45],
            opacity: [0, 0.8, 0],
            scale: [0.6, 1.2, 0.4],
          }}
          transition={{
            duration: 2.2 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.35,
            ease: "easeOut",
          }}
          className="absolute w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff] pointer-events-none"
        />
      ))}

      {/* Orbiting Tech HUD Ring */}
      <motion.svg
        viewBox="0 0 120 120"
        className="absolute inset-0 w-full h-full pointer-events-none p-2"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
        <circle
          cx="60"
          cy="6"
          r="2.5"
          fill="#ffffff"
          className="shadow-[0_0_8px_#ffffff]"
        />
      </motion.svg>

      {/* Specific Dynamic Mascot Character based on type */}
      {type === "hackathon" && <HackathonCoderMascot eyeX={eyeX} eyeY={eyeY} isHovered={isHovered} />}
      {type === "esports" && <EsportsGamerMascot eyeX={eyeX} eyeY={eyeY} isHovered={isHovered} />}
      {type === "cultural" && <CulturalDJMascot eyeX={eyeX} eyeY={eyeY} isHovered={isHovered} />}
      {(type === "subevents" || (type !== "hackathon" && type !== "esports" && type !== "cultural")) && (
        <SpeedRunnerMascot eyeX={eyeX} eyeY={eyeY} isHovered={isHovered} />
      )}

      {/* Holographic Scanline Sweep */}
      <motion.div
        animate={{ y: ["-100%", "200%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-white/[0.08] to-transparent pointer-events-none"
      />

      {/* HUD Corner Tech Accents */}
      <span className="absolute top-1.5 left-1.5 text-[8px] font-mono text-zinc-600">┌</span>
      <span className="absolute top-1.5 right-1.5 text-[8px] font-mono text-zinc-600">┐</span>
      <span className="absolute bottom-1.5 left-1.5 text-[8px] font-mono text-zinc-600">└</span>
      <span className="absolute bottom-1.5 right-1.5 text-[8px] font-mono text-zinc-600">┘</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. HACKATHON CODER MASCOT:
      - Rapid typing animated hands
      - Holographic floating glowing matrix keyboard
      - Terminal screen reflecting code
   ───────────────────────────────────────────────────────────── */
function HackathonCoderMascot({
  eyeX,
  eyeY,
  isHovered,
}: {
  eyeX: any;
  eyeY: any;
  isHovered: boolean;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
        rotate: [0, 1, 0, -1, 0],
      }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 flex flex-col items-center justify-center will-change-transform"
    >
      {/* Top Antenna Beacon */}
      <div className="flex flex-col items-center">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#ffffff]"
        />
        <div className="w-0.5 h-2 bg-zinc-600" />
      </div>

      {/* Cyber Robot Head / Helmet */}
      <div className="relative w-14 h-12 rounded-2xl bg-zinc-900 border-2 border-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
        {/* Gloss highlight */}
        <div className="absolute top-0 inset-x-0 h-2 bg-white/20 rounded-t-xl" />

        {/* Visor Screen */}
        <div className="relative w-11 h-7 rounded-xl bg-black border border-zinc-700 flex items-center justify-center gap-2 overflow-hidden shadow-inner">
          {/* Matrix code lines floating in visor */}
          <div className="absolute inset-0 opacity-25 flex flex-col justify-around py-0.5 px-1 font-mono text-[5px] text-zinc-400">
            <span>&gt;_ 0101</span>
            <span>&gt;_ INIT</span>
          </div>

          {/* Interactive Responsive Eyes */}
          <motion.div
            style={{ x: eyeX, y: eyeY }}
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
            className="flex items-center gap-2 relative z-10"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
          </motion.div>
        </div>

        {/* Ear tech nodes */}
        <div className="absolute -left-1 w-1.5 h-4 rounded-sm bg-zinc-500" />
        <div className="absolute -right-1 w-1.5 h-4 rounded-sm bg-zinc-500" />
      </div>

      {/* Torso & Core */}
      <div className="relative w-10 h-7 mt-0.5 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center">
        {/* Glowing Reactor Core */}
        <motion.div
          animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-white/80 border border-white shadow-[0_0_12px_#ffffff] flex items-center justify-center text-[6px] font-mono text-black font-black"
        >
          ⚡
        </motion.div>
      </div>

      {/* Floating Holographic Keyboard & Rapid Typing Hands */}
      <div className="relative -mt-1.5 flex flex-col items-center">
        {/* Animated Typing Hands */}
        <div className="flex items-center justify-between w-14 px-1 z-20">
          <motion.div
            animate={{
              y: [0, -3, 0, -2, 0],
              x: [-1, 2, -1],
            }}
            transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
            className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-600 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
          <motion.div
            animate={{
              y: [-2, 0, -3, 0, -1],
              x: [1, -2, 1],
            }}
            transition={{ duration: 0.45, repeat: Infinity, ease: "easeInOut" }}
            className="w-2.5 h-2.5 rounded-full bg-zinc-300 border border-zinc-600 shadow-[0_0_6px_rgba(255,255,255,0.4)]"
          />
        </div>

        {/* Floating Holographic Keyboard Plane */}
        <motion.div
          animate={{
            rotateX: 45,
            y: [0, -2, 0],
            boxShadow: [
              "0 0 10px rgba(255,255,255,0.3)",
              "0 0 20px rgba(255,255,255,0.6)",
              "0 0 10px rgba(255,255,255,0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-5 rounded-md bg-zinc-900/90 border border-white/80 backdrop-blur-md flex items-center justify-around px-1 z-10"
        >
          <span className="w-1.5 h-1 bg-white/70 rounded-xs animate-pulse" />
          <span className="w-1.5 h-1 bg-white/70 rounded-xs animate-ping" />
          <span className="w-1.5 h-1 bg-white/70 rounded-xs animate-pulse" />
          <span className="w-2.5 h-1 bg-white/90 rounded-xs" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. ESPORTS GAMER MASCOT:
      - Futuristic LED Gaming Headset
      - Interactive Sci-Fi Controller with glowing thumbsticks
      - Reactive eye HUD
   ───────────────────────────────────────────────────────────── */
function EsportsGamerMascot({
  eyeX,
  eyeY,
  isHovered,
}: {
  eyeX: any;
  eyeY: any;
  isHovered: boolean;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -6, 0],
        rotate: [0, -1.5, 0, 1.5, 0],
      }}
      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 flex flex-col items-center justify-center will-change-transform"
    >
      {/* Gaming Headset Band */}
      <div className="relative -mb-1 w-16 h-5 rounded-t-full border-t-2 border-x-2 border-white/80 z-20" />

      {/* Cyber Robot Head with Big Headphone Earcups */}
      <div className="relative w-14 h-12 rounded-2xl bg-zinc-900 border-2 border-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-visible">
        {/* Left Ear Cup with Glowing RGB Ring */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute -left-2.5 w-3.5 h-6 rounded-lg bg-zinc-950 border-2 border-white shadow-[0_0_10px_#ffffff] flex items-center justify-center"
        >
          <div className="w-1 h-3 rounded-full bg-white" />
        </motion.div>

        {/* Right Ear Cup */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
          className="absolute -right-2.5 w-3.5 h-6 rounded-lg bg-zinc-950 border-2 border-white shadow-[0_0_10px_#ffffff] flex items-center justify-center"
        >
          <div className="w-1 h-3 rounded-full bg-white" />
        </motion.div>

        {/* Headset Mic Boom */}
        <div className="absolute -bottom-1 -left-1 flex items-center z-30">
          <div className="w-4 h-0.5 bg-zinc-400 rotate-12" />
          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-ping" />
        </div>

        {/* Visor Screen with Target Crosshair Eyes */}
        <div className="relative w-11 h-7 rounded-xl bg-black border border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner">
          <motion.div
            style={{ x: eyeX, y: eyeY }}
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 3.2, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
            className="flex items-center gap-2 relative z-10"
          >
            {/* Crosshair Eye Left */}
            <div className="relative w-3 h-3 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              <div className="absolute inset-0 border border-white/50 rounded-full animate-spin" />
            </div>
            {/* Crosshair Eye Right */}
            <div className="relative w-3 h-3 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
              <div className="absolute inset-0 border border-white/50 rounded-full animate-spin" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Torso */}
      <div className="relative w-10 h-6 mt-0.5 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center">
        <span className="font-mono text-[6px] text-zinc-400 font-bold tracking-widest">PRO</span>
      </div>

      {/* Cyber Wireless Gamepad Controller */}
      <motion.div
        animate={{
          y: isHovered ? [-1, -4, -1] : [0, -2, 0],
          rotate: [0, -3, 3, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative -mt-1.5 z-20 w-14 h-6 rounded-xl bg-zinc-900 border-2 border-white/90 shadow-[0_0_15px_rgba(255,255,255,0.4)] flex items-center justify-between px-1.5"
      >
        {/* D-PAD Left */}
        <div className="relative w-2.5 h-2.5 flex items-center justify-center">
          <div className="absolute w-2.5 h-0.5 bg-zinc-400" />
          <div className="absolute w-0.5 h-2.5 bg-zinc-400" />
        </div>

        {/* Center Glowing Logo */}
        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_#ffffff] animate-pulse" />

        {/* Action Buttons Right (XYAB) */}
        <div className="grid grid-cols-2 gap-0.5">
          <span className="w-1 h-1 rounded-full bg-white" />
          <span className="w-1 h-1 rounded-full bg-zinc-400" />
          <span className="w-1 h-1 rounded-full bg-zinc-400" />
          <span className="w-1 h-1 rounded-full bg-white" />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. CULTURAL DJ MASCOT:
      - DJ Headphones & Sunglasses/Audio Spectrum Visor
      - Dual Spinning Vinyl Sound Decks
      - Animated Soundwave Visualizer
   ───────────────────────────────────────────────────────────── */
function CulturalDJMascot({
  eyeX,
  eyeY,
  isHovered,
}: {
  eyeX: any;
  eyeY: any;
  isHovered: boolean;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -7, 0],
        rotate: [-1, 1, -1],
      }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 flex flex-col items-center justify-center will-change-transform"
    >
      {/* Angled DJ Headphone Band */}
      <div className="relative -mb-1 w-16 h-5 rounded-t-full border-t-2 border-x-2 border-zinc-400 rotate-6 z-20" />

      {/* Cyber Robot Head with Cool Shades */}
      <div className="relative w-14 h-12 rounded-2xl bg-zinc-900 border-2 border-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-visible">
        {/* DJ Headphones */}
        <div className="absolute -left-2 w-3 h-5 rounded-md bg-zinc-950 border border-white" />
        <div className="absolute -right-2 w-3 h-5 rounded-md bg-zinc-950 border border-white" />

        {/* Equalizer Spectrum Visor */}
        <div className="relative w-11 h-7 rounded-xl bg-black border border-zinc-700 flex items-center justify-center px-1 overflow-hidden shadow-inner">
          {/* Animated Graphic Equalizer Bars */}
          <div className="flex items-end justify-center gap-0.5 w-full h-4">
            {[4, 8, 12, 16, 14, 10, 6].map((maxH, idx) => (
              <motion.div
                key={idx}
                animate={{
                  height: [
                    2,
                    maxH,
                    Math.max(3, maxH * 0.4),
                    maxH * 0.9,
                    2,
                  ],
                }}
                transition={{
                  duration: 0.6 + idx * 0.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="w-1 bg-white rounded-t-xs shadow-[0_0_6px_#ffffff]"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Torso */}
      <div className="relative w-10 h-6 mt-0.5 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center">
        <span className="text-[6px] font-mono text-zinc-300">BEAT</span>
      </div>

      {/* Futuristic DJ Turntable Mix Deck */}
      <div className="relative -mt-1 z-20 w-16 h-6 rounded-md bg-zinc-900 border-2 border-zinc-600 shadow-[0_0_15px_rgba(255,255,255,0.3)] flex items-center justify-between px-1">
        {/* Left Spinning Vinyl */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full bg-zinc-950 border border-white flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>

        {/* Crossfader */}
        <motion.div
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          className="w-1 h-3 bg-white rounded-xs"
        />

        {/* Right Spinning Vinyl */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          className="w-4 h-4 rounded-full bg-zinc-950 border border-white flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. SPEED RUNNER / SUB-EVENTS MASCOT:
      - Lightning Cyber Ears
      - Floating Geometric Hypercube Puzzle in Hand
      - Particle Sprint Jets
   ───────────────────────────────────────────────────────────── */
function SpeedRunnerMascot({
  eyeX,
  eyeY,
  isHovered,
}: {
  eyeX: any;
  eyeY: any;
  isHovered: boolean;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -8, 0],
        rotate: [0, 2, 0, -2, 0],
      }}
      transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 flex flex-col items-center justify-center will-change-transform"
    >
      {/* Speed Wing Ears on Helmet */}
      <div className="flex items-center justify-between w-18 -mb-2 z-20">
        <motion.div
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-3 h-1.5 rounded-tl-full bg-white shadow-[0_0_8px_#ffffff]"
        />
        <motion.div
          animate={{ rotate: [5, -5, 5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-3 h-1.5 rounded-tr-full bg-white shadow-[0_0_8px_#ffffff]"
        />
      </div>

      {/* Cyber Robot Head */}
      <div className="relative w-14 h-12 rounded-2xl bg-zinc-900 border-2 border-zinc-600 shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-visible">
        {/* Dynamic Focus Eyes */}
        <div className="relative w-11 h-7 rounded-xl bg-black border border-zinc-700 flex items-center justify-center overflow-hidden shadow-inner">
          <motion.div
            style={{ x: eyeX, y: eyeY }}
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
            className="flex items-center gap-2 relative z-10"
          >
            <div className="w-3 h-2 rounded-sm bg-white shadow-[0_0_8px_#ffffff] rotate-6" />
            <div className="w-3 h-2 rounded-sm bg-white shadow-[0_0_8px_#ffffff] -rotate-6" />
          </motion.div>
        </div>
      </div>

      {/* Torso & Floating Geometric Hypercube */}
      <div className="relative w-10 h-7 mt-0.5 rounded-lg bg-zinc-950 border border-zinc-700 flex items-center justify-center">
        {/* 3D Rotating Glowing Hypercube */}
        <motion.div
          animate={{
            rotate: [0, 90, 180, 270, 360],
            scale: [1, 1.25, 1],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="relative w-4 h-4 border-2 border-white bg-zinc-900 shadow-[0_0_12px_#ffffff] flex items-center justify-center"
        >
          <div className="w-1.5 h-1.5 bg-white" />
        </motion.div>
      </div>

      {/* Thruster Jet Flames */}
      <div className="flex items-center gap-3 -mt-0.5">
        <motion.div
          animate={{
            scaleY: [1, 2.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="w-1.5 h-3 rounded-b-full bg-white shadow-[0_0_8px_#ffffff]"
        />
        <motion.div
          animate={{
            scaleY: [1.8, 1, 1.8],
            opacity: [1, 0.6, 1],
          }}
          transition={{ duration: 0.35, repeat: Infinity }}
          className="w-1.5 h-3 rounded-b-full bg-white shadow-[0_0_8px_#ffffff]"
        />
      </div>
    </motion.div>
  );
}
