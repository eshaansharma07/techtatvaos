"use client";

import { useEffect, useState } from "react";
import { MotionLogo } from "./brand-motion";
import { DesktopNav, DesktopConnectButton } from "./desktop-nav";
import { MobilePublicMenu } from "./mobile-public-menu";

export function AnimatedHeader({ logo }: { logo?: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 25);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="public-header fixed inset-x-0 top-0 z-[70] pt-[env(safe-area-inset-top)] transition-all duration-300">
      <div
        className={`public-header-inner mx-3.5 mt-2 md:mx-auto flex max-w-7xl xl:max-w-[1380px] 2xl:max-w-[1536px] flex-row items-center justify-between px-4 py-3 md:px-5 md:py-0 border rounded-[22px] md:rounded-[999px] transition-all duration-300 ${
          scrolled
            ? "border-purple-500/30 bg-black/90 md:bg-black/95 md:mt-2.5 md:h-[4.2rem] shadow-[0_8px_32px_rgba(139,92,246,0.22)] backdrop-blur-2xl"
            : "border-white/10 md:border-2 md:border-white/15 bg-black/75 md:bg-black/90 md:mt-4 md:h-[4.75rem] shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        }`}
      >
        <MotionLogo logo={logo} />
        <DesktopNav />
        <DesktopConnectButton />
        <MobilePublicMenu logo={logo} />
      </div>
    </header>
  );
}
