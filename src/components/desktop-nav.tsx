"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

export const publicLinks = [
  ["HOME", "/"],
  ["ABOUT", "/about"],
  ["RECRUITMENT", "/recruitment"],
  ["JOIN US", "/join"],
  ["EVENTS", "/events"],
  ["LEADERBOARD", "/leaderboard"],
  ["TEAMS", "/teams"],
  ["HALL OF FAME", "/hall-of-fame"],
  ["GALLERY", "/gallery"]
] as const;

export function DesktopNav() {
  const pathname = usePathname();
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <nav 
      className="public-nav relative hidden items-center gap-1 rounded-full border border-white/12 bg-white/[0.03] p-1 text-xs font-semibold tracking-[0.14em] text-white/60 md:flex backdrop-blur-md"
      onMouseLeave={() => setHoveredPath(null)}
      aria-label="Main Navigation"
    >
      {publicLinks.map(([label, href]) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const isHovered = hoveredPath === href;
        const isIndicatorActive = isHovered || (!hoveredPath && isActive);

        return (
          <Link
            key={href}
            href={href}
            onMouseEnter={() => setHoveredPath(href)}
            className={`relative rounded-full px-3.5 py-2 text-[11px] font-bold uppercase transition-colors duration-200 select-none ${
              isActive || isHovered ? "text-white" : "text-white/50 hover:text-white/80"
            }`}
          >
            {/* Sliding magnetic capsule indicator */}
            {isIndicatorActive && (
              <motion.span
                layoutId="navActivePill"
                className="absolute inset-0 rounded-full border border-purple-400/40 bg-gradient-to-r from-purple-600/30 via-fuchsia-600/20 to-purple-600/30 shadow-[0_0_16px_rgba(168,85,247,0.35)]"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.8,
                }}
                aria-hidden="true"
              />
            )}

            {/* Label text */}
            <span className="relative z-10 flex items-center gap-1.5">
              {label}
              {isActive && (
                <span 
                  className="h-1 w-1 rounded-full bg-purple-400 shadow-[0_0_6px_#c084fc]" 
                  aria-hidden="true"
                />
              )}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function DesktopConnectButton() {
  return (
    <Link
      href="/contact"
      className="group relative hidden h-8 items-center gap-1.5 overflow-hidden rounded-full border border-white/20 bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 px-3.5 text-[10px] font-extrabold tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] active:scale-[0.97] md:inline-flex"
    >
      {/* Light sweep animation */}
      <span
        className="pointer-events-none absolute -inset-full h-[300%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-[400%]"
        aria-hidden="true"
      />
      <span className="relative z-10 font-mono">CONNECT</span>
      <ArrowUpRight size={13} className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
