"use client";

import Link from "next/link";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export function EditorialDock() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Fade out subtly when scrolling down deeply into content
      if (window.scrollY > 400) {
        setVisible(false);
      } else {
        setVisible(true);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-6 inset-x-0 z-40 px-6 sm:px-10 max-w-[1720px] mx-auto pointer-events-none transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        
        {/* Left: Avatar Stack + Member Count */}
        <div className="hidden sm:flex items-center gap-3.5 px-4 py-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl pointer-events-auto shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-gradient-to-tr from-blue-600 to-indigo-400" />
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-gradient-to-tr from-purple-600 to-pink-400" />
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-gradient-to-tr from-amber-600 to-yellow-400" />
            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-black bg-gradient-to-tr from-emerald-600 to-teal-400" />
          </div>
          <div className="text-[11px] font-mono tracking-wide">
            <span className="font-bold text-white">500+</span>{" "}
            <span className="text-white/40">members and growing</span>
          </div>
        </div>

        {/* Center: Scroll Indicator */}
        <div className="mx-auto flex flex-col items-center gap-1 text-[9px] font-mono tracking-[0.25em] text-white/50 uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <ArrowDown size={11} className="animate-bounce text-white/70" />
            <span className="w-1 h-1 rounded-full bg-white/40" />
          </div>
          <span>SCROLL TO EXPLORE</span>
        </div>

        {/* Right: Community Quote & Link */}
        <Link
          href="/teams"
          className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-black/60 backdrop-blur-xl pointer-events-auto hover:border-white/25 transition shadow-[0_10px_25px_rgba(0,0,0,0.5)] group"
        >
          <span className="text-[11px] text-white/70 font-medium italic">
            &ldquo;A community that builds.&rdquo;
          </span>
          <ArrowUpRight size={12} className="text-white/40 group-hover:text-white transition-colors" />
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 text-white/60 text-[10px]">
            <Plus size={10} />
          </div>
        </Link>

      </div>
    </div>
  );
}
