"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Hexagon } from "lucide-react";

export function MotionLogo({ logo }: { logo?: string }) {
  return (
    <Link href="/" className="brand-lockup group" aria-label="Tech Tatva home">
      <span className="brand-orb" aria-hidden="true" />
      <span className="brand-mark-wrap">
        <span className="brand-mark-aura" />
        {logo ? (
          <img src={logo} alt="" className="brand-mark" />
        ) : (
          <span className="brand-mark-fallback">
            <Hexagon size={28} />
          </span>
        )}
        <span className="brand-scan" />
      </span>
      <span className="brand-title" data-text="Tech Tatva">
        <span className="slice-t">T</span>ech <span><span className="slice-t">T</span>atva</span>
      </span>
    </Link>
  );
}

export function SiteLoader({ logo }: { logo?: string }) {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Check if already loaded in this session to skip loader
    if (typeof window !== "undefined" && sessionStorage.getItem("tt_loaded") === "true") {
      return; // Skip setting mounted to true to prevent transition flash
    }

    setMounted(true);
    const startTime = Date.now();
    const duration = 1350; // duration in ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(pct);
      if (elapsed >= duration) {
        clearInterval(interval);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("tt_loaded", "true");
        }
      }
    }, 16);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!mounted) return null;
  if (progress >= 100) return null;

  return (
    <div className="site-loader" aria-label="Loading Tech Tatva">
      <div className="loader-sexy-container">
        {/* Sleek dual spinning vector rings */}
        <div className="loader-sexy-spinner">
          <svg viewBox="0 0 100 100" className="spinner-svg-outer">
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" fill="none" />
            <circle cx="50" cy="50" r="44" stroke="#ffffff" strokeWidth="2" fill="none" 
              strokeDasharray="276" strokeDashoffset={276 - (276 * progress) / 100}
              strokeLinecap="round" className="spinner-progress-circle" />
          </svg>
          <div className="spinner-inner-glow" />
        </div>

        {/* Clean, premium lettering */}
        <h1 className="loader-sexy-logo">
          TECH<span>TATVA</span>
        </h1>
        
        {/* Minimalist percentage counter */}
        <div className="loader-sexy-meta">
          <span className="loader-sexy-status">INITIALIZING SYSTEM</span>
          <span className="loader-sexy-percentage">{progress.toString().padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}
