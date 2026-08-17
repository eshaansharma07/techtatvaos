"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Trophy, Users, Shield, Zap, Sparkles, ChevronRight } from "lucide-react";

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

    rotateX.set(-yPct * 7); // Max 7 deg tilt
    rotateY.set(xPct * 7);

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

  const spotlightBg = useMotionTemplate`radial-gradient(380px circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.08), transparent 75%)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 35, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.25 } }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
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
        className="group relative rounded-3xl bg-zinc-950/90 border border-zinc-900 hover:border-zinc-700 transition-colors duration-500 overflow-hidden flex flex-col justify-between p-7 sm:p-9 will-change-transform shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
      >
        {/* Dynamic Holographic Spotlight Layer */}
        <motion.div
          style={{ background: spotlightBg }}
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 z-10"
        />

        {/* Ambient Grid Texture in Card */}
        <div className="absolute inset-0 tm-grid-bg opacity-20 pointer-events-none" />

        {/* Animated Laser Border Sweep on Hover */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

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

        {/* ── CARD HEADER ── */}
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

          {/* Icon & Title Block */}
          <div className="flex items-start gap-4">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-white shadow-[0_0_20px_rgba(255,255,255,0.06)] group-hover:border-zinc-600 transition-colors"
            >
              {event.icon}
            </motion.div>
            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-white group-hover:text-zinc-100 transition-colors tracking-tight">
                {event.title}
              </h3>
              <p className="text-xs font-mono font-medium text-zinc-400 tracking-wider uppercase">
                {event.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed pt-1">
            {event.description}
          </p>
        </div>

        {/* ── CARD FOOTER / TELEMETRY & CTA ── */}
        <div className="relative z-20 pt-6 mt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Prize Pool Badge */}
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-200">
            <div className="p-1 rounded bg-zinc-900 border border-zinc-800 text-white">
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
