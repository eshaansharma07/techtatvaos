"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Hexagon } from "lucide-react";

export function MotionLogo({ logo }: { logo?: string }) {
  return (
    <Link href="/" className="brand-lockup group" aria-label="Tech Tatva home">
      <span className="brand-orb" aria-hidden="true" />
      <span className="brand-mark-wrap">
        <span className="brand-mark-aura" />
        {logo ? (
          <Image src={logo} alt="" className="brand-mark" width={100} height={100} />
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

let hasLoaded = false;

export function SiteLoader({ logo }: { logo?: string }) {
  const [visible, setVisible] = useState(!hasLoaded);
  const circleRef = useRef<SVGCircleElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (hasLoaded) return;

    const startTime = Date.now();
    const duration = 1350; // duration in ms
    let animationFrameId: number;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.floor((elapsed / duration) * 100), 100);
      
      if (textRef.current) {
        textRef.current.innerText = pct.toString().padStart(3, "0");
      }
      
      if (circleRef.current) {
        circleRef.current.style.strokeDashoffset = (276 - (276 * pct) / 100).toString();
      }

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      } else {
        setVisible(false);
        hasLoaded = true;
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  if (!visible) return null;

  return (
    <div className="site-loader" aria-label="Loading Tech Tatva">
      <div className="loader-sexy-container">
        {/* Sleek dual spinning vector rings */}
        <div className="loader-sexy-spinner">
          <svg viewBox="0 0 100 100" className="spinner-svg-outer">
            <circle cx="50" cy="50" r="44" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" fill="none" />
            <circle ref={circleRef} cx="50" cy="50" r="44" stroke="#ffffff" strokeWidth="2" fill="none" 
              strokeDasharray="276" strokeDashoffset="276"
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
          <span ref={textRef} className="loader-sexy-percentage">000</span>
        </div>
      </div>
    </div>
  );
}
