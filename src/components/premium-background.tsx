"use client";

import { useEffect, useRef, useState } from "react";
import { ParticleNetwork } from "@/components/particle-network";

export function PremiumBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const mouseCoords = useRef({ x: 0, y: 0 });
  const targetCoords = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetCoords.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId: number;

    const tick = () => {
      mouseCoords.current.x += (targetCoords.current.x - mouseCoords.current.x) * 0.045;
      mouseCoords.current.y += (targetCoords.current.y - mouseCoords.current.y) * 0.045;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--px", `${mouseCoords.current.x * 12}px`);
        containerRef.current.style.setProperty("--py", `${mouseCoords.current.y * 12}px`);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [prefersReducedMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[-2] overflow-hidden bg-ink">
      {/* ── Particle Network Canvas (new) ── */}
      <ParticleNetwork />

      <div
        ref={containerRef}
        className="absolute inset-0 h-full w-full"
        style={{
          transform: "translate3d(var(--px, 0px), var(--py, 0px), 0px)",
          transition: prefersReducedMotion ? "none" : "transform 0.08s cubic-bezier(0.25, 1, 0.5, 1)",
        }}
      >
        {/* Softly glowing custom orbs */}
        <div className="absolute inset-0 opacity-80 mix-blend-screen pointer-events-none">
          {/* Top-right violet flare */}
          <div 
            className="absolute right-[-10%] top-[-10%] h-[750px] w-[750px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.18)_0%,transparent_70%)] animate-pulse" 
            style={{ animationDuration: "14s" }} 
          />
          {/* Left fuchsia flare */}
          <div 
            className="absolute left-[-15%] top-[25%] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(232,121,166,0.13)_0%,transparent_70%)] animate-pulse" 
            style={{ animationDuration: "18s" }} 
          />
          {/* Center-bottom peach flare */}
          <div 
            className="absolute left-[30%] bottom-[-10%] h-[700px] w-[700px] rounded-full bg-[radial-gradient(circle,rgba(253,186,116,0.07)_0%,transparent_70%)] animate-pulse" 
            style={{ animationDuration: "16s" }} 
          />
        </div>

        {/* Moving grid background */}
        <div className="absolute inset-0 grid-bg opacity-[0.06] scale-[1.04]" />

        {/* Slowly rotating background rings (SVG vectors) */}
        {!prefersReducedMotion && (
          <div className="absolute right-[-120px] top-[-120px] opacity-[0.06] scale-[0.75] md:scale-95 origin-top-right select-none z-0">
            <svg width="600" height="600" viewBox="0 0 600 600" fill="none" className="animate-spin" style={{ animationDuration: "180s" }}>
              <circle cx="300" cy="300" r="280" stroke="url(#bg-ring-grad-1)" strokeWidth="0.75" strokeDasharray="16 32" />
              <circle cx="300" cy="300" r="220" stroke="url(#bg-ring-grad-2)" strokeWidth="0.5" />
              <circle cx="300" cy="300" r="160" stroke="url(#bg-ring-grad-1)" strokeWidth="0.5" strokeDasharray="6 12" />
              <defs>
                <linearGradient id="bg-ring-grad-1" x1="0" y1="0" x2="600" y2="600" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#a855f7" />
                  <stop offset="0.5" stopColor="#ec4899" />
                  <stop offset="1" stopColor="#f97316" />
                </linearGradient>
                <linearGradient id="bg-ring-grad-2" x1="600" y1="0" x2="0" y2="600" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#3b82f6" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
