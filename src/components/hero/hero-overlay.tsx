"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useState } from "react";
import { VideoModal } from "@/components/ui/video-modal";

interface HeroOverlayProps {
  stats?: {
    members?: number;
    events?: number;
    teams?: number;
    community?: number;
  };
}

export function HeroOverlay({ stats }: HeroOverlayProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const memberCount = stats?.members || 500;
  const eventCount = stats?.events || 25;
  const teamCount = stats?.teams || 8;

  return (
    <>
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between pt-28 pb-14 px-6 sm:px-10 md:px-14 lg:px-18 max-w-[1720px] mx-auto pointer-events-none select-none">
        
        {/* Left Vertical Indicator Rail (01 -> 05) */}
        <div className="hidden xl:flex flex-col items-center gap-4 text-[11px] font-mono tracking-widest text-white/35 absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none">
          <span className="text-white font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
            01
          </span>
          <span className="w-px h-6 bg-white/15" />
          <span className="hover:text-white/70 transition">02</span>
          <span className="hover:text-white/70 transition">03</span>
          <span className="hover:text-white/70 transition">04</span>
          <span className="hover:text-white/70 transition">05</span>
        </div>

        {/* Right Edge Restrained Community Statistics Strip */}
        <div className="hidden md:flex flex-col items-end gap-6 text-right absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.35)] mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{memberCount}+</p>
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">Members</p>
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{eventCount}+</p>
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">Events</p>
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">{teamCount}</p>
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">Teams</p>
          </div>

          <div>
            <p className="text-xl sm:text-2xl font-bold tracking-tight text-white">1</p>
            <p className="text-[10px] font-mono tracking-[0.2em] text-white/45 uppercase">Community</p>
          </div>
        </div>

        {/* Left Editorial Column: Eyebrow, Headline, Supporting Copy, Actions */}
        <div className="my-auto max-w-xl xl:max-w-2xl pointer-events-auto pl-0 xl:pl-8">
          {/* Architectural Eyebrow */}
          <div className="inline-flex items-center gap-2.5 sm:gap-3 mb-5 sm:mb-6 max-w-full overflow-hidden">
            <span className="w-5 sm:w-7 h-[1.5px] bg-amber-400/90 shrink-0" />
            <p className="text-[9px] sm:text-[11px] font-mono tracking-[0.18em] sm:tracking-[0.28em] uppercase text-amber-300 font-semibold truncate">
              ROOTED IN KNOWLEDGE . RISING WITH TECHNOLOGY
            </p>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-[2.75rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-bold tracking-[-0.035em] leading-[1.04] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.7)]">
            Students.<br />
            Ideas.<br />
            <span className="text-white/90">Real Impact.</span>
          </h1>

          {/* Supporting Narrative Copy */}
          <p className="mt-7 text-sm sm:text-base text-white/75 leading-relaxed max-w-lg font-normal drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
            Tech Tatva is the official technology community of Chandigarh University, where curious minds come together to build, learn, create and turn ideas into real-world impact.
          </p>

          {/* Action CTAs */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="#pillars"
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              <span>Explore Our World</span>
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-white/20 bg-white/[0.05] backdrop-blur-xl text-white font-medium text-xs sm:text-sm tracking-wide transition-all duration-300 hover:bg-white/[0.1] hover:border-white/30 active:scale-[0.98]"
            >
              <Play size={13} className="fill-white text-white" />
              <span>Watch Story</span>
            </button>
          </div>
        </div>

        {/* Center-Right Holographic Glass HUD Telemetry (as in Reference Screenshot) */}
        <div className="hidden 2xl:flex absolute left-[38%] bottom-32 flex-col gap-1.5 p-4 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md pointer-events-none">
          <p className="text-[9px] font-mono tracking-[0.24em] text-cyan-300 uppercase font-semibold">DIRECTIVE // 01</p>
          <div className="text-[11px] font-mono font-bold tracking-wider text-white/90 leading-tight">
            BUILD<br />
            LEARN<br />
            COLLABORATE<br />
            CREATE
          </div>
          <div className="mt-1.5 w-24 h-px bg-gradient-to-r from-cyan-400/60 to-transparent" />
          <p className="text-[8px] font-mono text-white/40 tracking-wider">CHANDIGARH UNIVERSITY</p>
        </div>

      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"
        title="Tech Tatva — The Story of Innovation"
      />
    </>
  );
}
