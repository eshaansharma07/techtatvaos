"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { useRef } from "react";

interface PillarItem {
  id: string;
  number: string;
  title: string;
  tagline: string;
  image: string;
  link: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "learn",
    number: "01",
    title: "Learn",
    tagline: "Hands-on workshops, bootcamps, and technical sessions.",
    image: "/cinematic/pillar-learn.jpg",
    link: "/events"
  },
  {
    id: "build",
    number: "02",
    title: "Build",
    tagline: "Turn ideas into real projects, prototypes, and solutions.",
    image: "/cinematic/pillar-build.jpg",
    link: "/teams"
  },
  {
    id: "connect",
    number: "03",
    title: "Connect",
    tagline: "A community of curious, collaborative, and driven minds.",
    image: "/cinematic/pillar-connect.jpg",
    link: "/join"
  },
  {
    id: "impact",
    number: "04",
    title: "Create Impact",
    tagline: "Technology built with purpose to shape a better tomorrow.",
    image: "/cinematic/pillar-impact.jpg",
    link: "/about"
  }
];

export function PillarsSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section id="pillars" className="relative z-20 py-24 px-6 sm:px-10 md:px-16 lg:px-20 max-w-[1720px] mx-auto">
      
      {/* Curved Architectural Shelf / Ribbon Ambient Lighting */}
      <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-transparent via-[#0B0E15]/60 to-[#07090D] pointer-events-none" />

      {/* Main Architectural Shelf Container */}
      <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0A0D14]/70 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Subtle Ambient Top Rim Highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-px bg-blue-400" />
              <p className="text-[10px] font-mono tracking-[0.26em] uppercase text-blue-400 font-semibold">
                OUR PILLARS
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              More than a club.
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-white/40 tracking-wider">04 CORE DISCIPLINES</span>
            <button
              onClick={scrollRight}
              aria-label="Scroll pillars"
              className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 flex items-center justify-center transition active:scale-95"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* 4 Horizontal Glass Capsule Cards */}
        <div
          ref={scrollContainerRef}
          className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-2 no-scrollbar scroll-smooth snap-x snap-mandatory"
        >
          {PILLARS.map((pillar) => (
            <Link
              key={pillar.id}
              href={pillar.link}
              className="group relative flex-none w-[280px] sm:w-[320px] md:w-[340px] snap-start rounded-3xl border border-white/10 bg-white/[0.025] hover:border-blue-500/40 hover:bg-white/[0.05] p-4 sm:p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
            >
              {/* Subtle hover gradient bloom */}
              <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              {/* Capsule Image Thumbnail */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden mb-4 bg-black/40">
                <Image
                  src={pillar.image}
                  alt={pillar.title}
                  fill
                  sizes="(max-width: 768px) 280px, 340px"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Pillar Index Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/80 font-bold">
                  {pillar.number}
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-white/60 leading-relaxed font-normal">
                    {pillar.tagline}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-white/40 group-hover:text-white transition-colors">
                  <span>DISCOVER</span>
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
