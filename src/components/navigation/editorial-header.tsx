"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Compass, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "ABOUT", href: "/about" },
  { label: "EVENTS", href: "/events" },
  { label: "TEAMS", href: "/teams" },
  { label: "GALLERY", href: "/gallery" },
  { label: "RECRUITMENT", href: "/recruitment" }
];

export function EditorialHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 pt-4 px-4 sm:px-8 md:px-12 transition-all duration-300">
      <div
        className={`max-w-[1600px] mx-auto flex items-center justify-between px-5 sm:px-6 py-3 rounded-full border transition-all duration-300 ${
          scrolled
            ? "border-white/15 bg-black/80 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)]"
            : "border-white/10 bg-black/40 backdrop-blur-xl"
        }`}
      >
        {/* Brand Logo & Wordmark (Authentic TechTatva Emblem) */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:scale-110">
            <svg viewBox="0 0 1080 1080" fill="currentColor" className="w-full h-full text-white">
              {/* Top Piece */}
              <path d="M571.06,40.52l263.19,443.91c4.48,7.56-.99,17.11-9.77,17.08l-566.35-2.11c-8.66-.03-14.07-9.39-9.78-16.91L497.21,46.12c.33-.57.7-1.13,1.12-1.64,19.61-23.89,47.2-27.63,70.58-6.59.84.76,1.56,1.66,2.14,2.64Z" />
              {/* Bottom Left Piece */}
              <path d="M525.76,942.5c0,11.11-9.01,20.12-20.12,20.12H86.19c-45.61,0-83.59-64.35-59.94-105.14l197.58-328.08c3.64-6.05,10.18-9.74,17.24-9.74h264.56c11.11,0,20.12,9.01,20.12,20.12v402.71Z" />
              {/* Bottom Right Piece */}
              <path d="M546.1,942.53c0-70.24.02-305.9,0-405.27,0-10.97,8.89-19.86,19.87-19.86h273.85c7.05,0,13.57,3.73,17.14,9.81l184.12,313.54c.22.38.47.75.72,1.12,32.73,46.84.7,120.75-58.39,120.75h-417.21c-11.1,0-20.1-8.99-20.1-20.09Z" />
            </svg>
          </div>
          <span className="font-bold text-sm sm:text-base tracking-[0.25em] text-white">
            TECHTATVA
          </span>
        </Link>

        {/* Center Pill Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs font-mono tracking-widest uppercase transition-all duration-200 ${
                  isActive
                    ? "text-white font-bold"
                    : "text-white/55 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right CTA & Compass Icon */}
        <div className="flex items-center gap-3">
          <Link
            href="/join"
            className="hidden xl:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.05] hover:bg-white hover:text-black text-white text-xs font-semibold tracking-wide transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <span>Join the Community</span>
            <ArrowRight size={13} />
          </Link>

          <Link
            href="/events"
            aria-label="Radar / Explore"
            className="w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] text-white/60 hover:text-white hover:border-white/30 flex items-center justify-center transition"
          >
            <Compass size={16} />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="lg:hidden w-9 h-9 rounded-full border border-white/15 bg-white/[0.04] text-white/80 flex items-center justify-center"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Fullscreen Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between animate-in fade-in duration-200">
          <nav className="flex flex-col gap-4 pt-6">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-bold tracking-tight py-2 border-b border-white/10 ${
                    isActive ? "text-blue-400" : "text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/join"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-6 flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white text-black font-bold text-sm tracking-wide"
            >
              <span>Join the Community</span>
              <ArrowRight size={16} />
            </Link>
          </nav>

          <div className="pb-8 text-xs font-mono text-white/40 text-center">
            CHANDIGARH UNIVERSITY · TECH TATVA
          </div>
        </div>
      )}
    </header>
  );
}
