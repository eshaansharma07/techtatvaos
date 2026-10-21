"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
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
      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between pt-28 pb-12 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto pointer-events-none select-none">
        
        {/* Top Eyebrow & Left Vertical Indicator Rail */}
        <div className="flex items-start justify-between w-full">
          {/* Left Vertical Pagination Rail (01 -> 05) */}
          <div className="hidden lg:flex flex-col items-center gap-4 text-[11px] font-mono tracking-widest text-white/35 pt-4">
            <span className="text-white font-bold flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60A5FA]" />
              01
            </span>
            <span className="w-px h-6 bg-white/10" />
            <span className="hover:text-white/70 transition">02</span>
            <span className="hover:text-white/70 transition">03</span>
            <span className="hover:text-white/70 transition">04</span>
            <span className="hover:text-white/70 transition">05</span>
          </div>

          {/* Oculus Sky & Campus Vista Aperture (Upper Right Backdrop) */}
          <div className="absolute right-[12%] top-16 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden opacity-35 mix-blend-screen pointer-events-none -z-10 blur-[1px]">
            <Image
              src="/cinematic/campus-vista.jpg"
              alt="Campus Vista"
              fill
              priority
              sizes="(max-width: 768px) 300px, 400px"
              className="object-cover object-center scale-110"
            />
            {/* Circular Vignette Overlay */}
            <div className="absolute inset-0 rounded-full ring-1 ring-white/20 bg-gradient-to-t from-[#07090D] via-transparent to-transparent" />
          </div>

          {/* Right Edge Community Stats Strip */}
          <div className="hidden md:flex flex-col items-end gap-6 text-right pt-6 pr-2">
            <div className="w-8 h-8 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.35)]">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight text-white">{memberCount}+</p>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Members</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight text-white">{eventCount}+</p>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Events</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight text-white">{teamCount}</p>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Teams</p>
            </div>

            <div>
              <p className="text-xl sm:text-2xl font-black tracking-tight text-white">1</p>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/40 uppercase">Community</p>
            </div>
          </div>
        </div>

        {/* Center / Left Editorial Headline Section */}
        <div className="my-auto max-w-2xl lg:max-w-3xl pointer-events-auto">
          {/* Architectural Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-6 h-px bg-amber-400/80" />
            <p className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-amber-300/90 font-medium">
              ROOTED IN KNOWLEDGE . RISING WITH TECHNOLOGY
            </p>
          </div>

          {/* Monumental Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] lg:text-[6.5rem] font-bold tracking-[-0.04em] leading-[0.92] text-white">
            Students.<br />
            Ideas.<br />
            <span className="bg-gradient-to-r from-white via-blue-200 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(147,197,253,0.3)]">
              Real Impact.
            </span>
          </h1>

          {/* Supporting Narrative Copy */}
          <p className="mt-8 text-sm sm:text-base md:text-[17px] text-white/70 leading-relaxed max-w-xl font-normal">
            Tech Tatva is the official technology community of Chandigarh University, where curious minds come together to build, learn, create and turn ideas into real-world impact.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="#pillars"
              className="inline-flex items-center gap-3 px-7 py-4 rounded-full bg-white text-black font-semibold text-xs sm:text-sm tracking-wide transition-all duration-300 hover:bg-neutral-200 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.25)]"
            >
              <span>Explore Our World</span>
              <ArrowRight size={15} />
            </Link>

            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-xl text-white font-medium text-xs sm:text-sm tracking-wide transition-all duration-300 hover:bg-white/[0.08] hover:border-white/25 active:scale-[0.98]"
            >
              <Play size={13} className="fill-white text-white" />
              <span>Watch Story</span>
            </button>
          </div>
        </div>

        {/* Center-Right Holographic Glass HUD Telemetry (as in Reference Screenshot) */}
        <div className="hidden xl:flex absolute left-[44%] bottom-28 flex-col gap-1.5 p-5 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md pointer-events-none">
          <p className="text-[9px] font-mono tracking-[0.24em] text-blue-300 uppercase font-semibold">DIRECTIVE // 01</p>
          <div className="text-xs font-mono font-bold tracking-wider text-white/90 leading-tight">
            BUILD<br />
            LEARN<br />
            COLLABORATE<br />
            CREATE
          </div>
          <div className="mt-2 w-28 h-px bg-gradient-to-r from-blue-400/60 to-transparent" />
          <p className="text-[8px] font-mono text-white/40 tracking-wider">CHANDIGARH UNIVERSITY</p>
        </div>

        {/* Right Curved Blade HUD (SAME IDEAS DIFFERENT REALITIES) */}
        <div className="hidden xl:flex absolute right-24 bottom-32 flex-col items-center gap-2 px-3 py-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
          <div className="writing-mode-vertical text-[9px] font-mono tracking-[0.3em] text-white/60 uppercase text-center">
            SAME IDEAS DIFFERENT REALITIES
          </div>
        </div>

        {/* Seated Silhouette Scale Figure (Positioned on the circular pavilion dais) */}
        <div className="hidden md:block absolute left-[52%] lg:left-[50%] bottom-0 w-72 h-72 lg:w-96 lg:h-96 pointer-events-none z-20 opacity-95">
          <Image
            src="/cinematic/seated-student.png"
            alt="Human Scale"
            fill
            priority
            sizes="(max-width: 1024px) 300px, 400px"
            className="object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.85)]"
          />
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
