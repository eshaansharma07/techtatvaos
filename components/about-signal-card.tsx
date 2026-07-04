"use client";

import React, { useRef, useState } from "react";
import { Compass, Target, LucideIcon } from "lucide-react";

const iconsMap: Record<string, LucideIcon> = {
  compass: Compass,
  target: Target
};

export function AboutSignalCard({ iconName, label, title, copy }: { iconName: "compass" | "target"; label: string; title: string; copy: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const Icon = iconsMap[iconName] || Compass;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  }

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        "--mouse-x": `${coords.x}px`,
        "--mouse-y": `${coords.y}px`
      } as React.CSSProperties}
      className={`about-signal-card group rounded-[2rem] p-6 md:p-8 transition-all duration-500 overflow-hidden relative border border-white/[0.08] bg-[#0c0a12]/60 hover:border-violet-400/25 ${
        isHovered ? "shadow-[0_20px_50px_rgba(139,92,246,0.1)] -translate-y-1" : ""
      }`}
    >
      {/* Glow aura background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(350px circle at var(--mouse-x) var(--mouse-y), rgba(168,85,247,0.12), transparent)`
        }}
      />
      {/* Glow border outline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 border border-violet-500/20 rounded-[2rem]"
        style={{
          maskImage: `radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), white, transparent)`,
          WebkitMaskImage: `radial-gradient(180px circle at var(--mouse-x) var(--mouse-y), white, transparent)`
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-violet-200/15 bg-violet-400/10 text-violet-200 group-hover:bg-violet-400/20 group-hover:text-violet-100 transition-all duration-300">
          <Icon size={18} />
        </span>
        <span className="text-[10px] font-bold tracking-[.25em] text-white/20 group-hover:text-violet-400/40 transition">LIVE</span>
      </div>
      
      <div className="relative z-10">
        <p className="mt-8 text-[10px] font-bold tracking-[.3em] text-violet-300/60 uppercase">{label}</p>
        <h2 className="mt-3 text-2xl font-bold tracking-[-.04em] text-white md:text-3xl transition group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-violet-200">
          {title}
        </h2>
        <p className="mt-4 text-sm leading-7 text-white/45 group-hover:text-white/60 transition duration-300">
          {copy}
        </p>
      </div>
    </article>
  );
}
