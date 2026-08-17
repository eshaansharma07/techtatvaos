"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Trophy, Users, ChevronRight, Sparkles } from "lucide-react";

export interface TechnomaniaEventItem {
  id: string;
  icon: React.ReactNode;
  category: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  prizes: string;
  slug: string;
  teamSize: string;
  mascotImage: string;
  mascotAlt: string;
  timeline?: string;
  slotsLeft?: number;
}

export function TechnomaniaInteractiveCard({
  event,
  index,
  getHref,
}: {
  event: TechnomaniaEventItem;
  index: number;
  getHref: (path: string) => string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt mechanics
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D rotation
  const rotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const rotateY = useSpring(0, { stiffness: 150, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Relative -1 to 1
    const xPct = (clientX / width - 0.5) * 2;
    const yPct = (clientY / height - 0.5) * 2;

    rotateX.set(-yPct * 6); // Max 6 deg tilt
    rotateY.set(xPct * 6);

    mouseX.set(clientX);
    mouseY.set(clientY);
  }

  function handleMouseEnter() {
    setIsHovered(true);
  }

  function handleMouseLeave() {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  }

  const spotlightBg = useMotionTemplate`radial-gradient(420px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.09), transparent 75%)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 1200 }}
      className="w-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="group relative rounded-3xl bg-zinc-950/95 border border-zinc-900 hover:border-zinc-700 transition-colors duration-500 overflow-hidden flex flex-col justify-between p-6 sm:p-8 will-change-transform shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.9)]"
      >
        {/* Dynamic Holographic Spotlight Layer */}
        <motion.div
          style={{ background: spotlightBg }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10"
        />

        {/* Ambient Grid Texture in Card */}
        <div className="absolute inset-0 tm-grid-bg opacity-20 pointer-events-none" />

        {/* Animated Laser Border Sweep on Hover */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

        {/* Corner Reticle Brackets */}
        <span className="absolute top-3 left-3 text-zinc-600 group-hover:text-white transition-colors font-mono text-xs select-none pointer-events-none">
          ┌
        </span>
        <span className="absolute top-3 right-3 text-zinc-600 group-hover:text-white transition-colors font-mono text-xs select-none pointer-events-none">
          ┐
        </span>
        <span className="absolute bottom-3 left-3 text-zinc-600 group-hover:text-white transition-colors font-mono text-xs select-none pointer-events-none">
          └
        </span>
        <span className="absolute bottom-3 right-3 text-zinc-600 group-hover:text-white transition-colors font-mono text-xs select-none pointer-events-none">
          ┘
        </span>

        {/* ── CARD CONTENT WITH 3D MASCOT ── */}
        <div className="relative z-20 space-y-5">
          {/* Top Status & Telemetry Row */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono font-bold tracking-[0.2em] text-zinc-300 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{event.tag}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 bg-zinc-950 px-2.5 py-1 rounded-md border border-zinc-900">
              <Users size={13} className="text-zinc-500" />
              <span>{event.teamSize}</span>
            </div>
          </div>

          {/* Main Showcase: Text Info + 3D Animated Floating Mascot */}
          <div className="flex flex-col-reverse sm:flex-row items-center sm:items-start justify-between gap-4 pt-1">
            {/* Left Column: Title & Description */}
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 4 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white shadow-[0_0_15px_rgba(255,255,255,0.06)] group-hover:border-zinc-600 transition-colors"
                >
                  {event.icon}
                </motion.div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-zinc-100 transition-colors tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs font-mono font-medium text-zinc-400 tracking-wider uppercase">
                    {event.subtitle}
                  </p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
                {event.description}
              </p>
            </div>

            {/* Right Column: 3D Mascot with Floating Physics */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 1.5, 0, -1.5, 0],
              }}
              transition={{
                duration: 4.5 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              whileHover={{ scale: 1.08, y: -12 }}
              className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 rounded-2xl overflow-hidden bg-black/50 border border-zinc-800/80 group-hover:border-zinc-600 transition-all shadow-[0_0_30px_rgba(0,0,0,0.8)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
            >
              {/* Soft Ambient Radial Behind Mascot */}
              <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none" />
              
              <Image
                src={event.mascotImage}
                alt={event.mascotAlt}
                fill
                className="object-contain p-1.5 transition-transform duration-500 group-hover:scale-105"
              />

              {/* Holographic Scanline Overlay on Mascot */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </motion.div>
          </div>
        </div>

        {/* ── CARD FOOTER / TELEMETRY & CTA ── */}
        <div className="relative z-20 pt-6 mt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Prize Pool Badge */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200">
            <div className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-white">
              <Trophy size={14} />
            </div>
            <span>{event.prizes}</span>
          </div>

          {/* Action Button Links */}
          <div className="flex items-center gap-2.5">
            <Link
              href={getHref(`/events/${event.slug}`)}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-mono text-xs font-bold tracking-wider uppercase inline-flex items-center gap-1.5 transition-all"
            >
              <span>DETAILS</span>
              <ChevronRight size={13} className="text-zinc-400" />
            </Link>

            <Link
              href={getHref("/register")}
              className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-mono text-xs font-black tracking-wider uppercase inline-flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
            >
              <span>REGISTER</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
