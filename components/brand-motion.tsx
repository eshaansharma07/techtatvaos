"use client";

import { useEffect, useState } from "react";
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
        Tech <span>Tatva</span>
      </span>
    </Link>
  );
}

export function SiteLoader({ logo }: { logo?: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="site-loader" aria-label="Loading Tech Tatva">
      <div className="loader-grid" />
      <div className="loader-core">
        <MotionLogo logo={logo} />
        <div className="loader-ring" aria-hidden="true" />
        <p>INITIALIZING CLUB NETWORK</p>
      </div>
    </div>
  );
}
