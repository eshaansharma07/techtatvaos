"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Instagram, Linkedin, Github, Zap, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react";
import { TM_CONFIG } from "@/lib/technomania-theme";
import { useTechnomaniaHref } from "@/lib/technomania-links";

function TechnomaniaNav() {
  const [isOpen, setIsOpen] = useState(false);
  const getHref = useTechnomaniaHref();

  const links = [
    { label: "EVENTS", href: "/events" },
    { label: "SCHEDULE", href: "/schedule" },
    { label: "TEAMS", href: "/teams" },
    { label: "LEADERBOARD", href: "/leaderboard" },
  ];

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 bg-tm-bg/90 backdrop-blur-md border-b border-white/10 h-16 flex items-center transition-all duration-300">
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between h-full">
          {/* Left: Tech Tatva Logo ✕ TM 3.0 Logo */}
          <Link href={getHref("/")} className="group flex items-center gap-2.5 sm:gap-3.5">
            {/* Tech Tatva Club Logo */}
            <div className="relative h-8 w-8 sm:h-9 sm:w-9 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/technomania/techtatva-logo.png"
                alt="Tech Tatva Club"
                fill
                className="object-contain drop-shadow-[0_0_12px_rgba(139,92,246,0.7)]"
                priority
              />
            </div>

            {/* Cross multiplier */}
            <span className="text-white/30 text-xs sm:text-sm font-light select-none">✕</span>

            {/* TM3.0 Emblem Logo */}
            <div className="relative h-6 w-20 sm:h-7 sm:w-24 shrink-0 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/technomania/logo-emblem.png"
                alt="TM 3.0"
                fill
                className="object-contain drop-shadow-[0_0_10px_rgba(74,158,255,0.7)]"
                priority
              />
            </div>
          </Link>

          {/* Center: Links (Desktop) */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={getHref(link.href)}
                className="relative text-xs font-tm-mono tracking-[0.2em] text-tm-muted hover:text-white transition-colors py-1 group"
              >
                <span>{link.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-tm-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Right: Register (Desktop) & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link
              href={getHref("/register")}
              className="hidden md:inline-flex items-center gap-2 tm-btn-solid text-xs px-5 py-2 hover:shadow-[0_0_20px_rgba(74,158,255,0.4)] transition-all group"
            >
              <Zap size={14} className="text-tm-accent group-hover:scale-110 transition-transform" />
              <span>REGISTER</span>
            </Link>
            <button
              className="md:hidden text-tm-muted hover:text-tm-text transition-colors p-2"
              onClick={() => setIsOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-tm-bg/98 backdrop-blur-xl border-b border-tm-border flex flex-col p-6 md:hidden"
          >
            <div className="flex items-center justify-between pb-6 border-b border-tm-border">
              <div className="flex items-center gap-3">
                <div className="relative h-8 w-8">
                  <Image
                    src="/technomania/techtatva-logo.png"
                    alt="Tech Tatva Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-white/20 text-xs font-mono">×</span>
                <div className="relative h-8 w-24">
                  <Image
                    src="/technomania/logo-white.png"
                    alt="TM3.0 Logo"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <button
                className="text-tm-muted hover:text-tm-text p-2"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col gap-6 py-10">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={getHref(link.href)}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-tm-heading tracking-widest text-tm-text hover:text-tm-accent transition-colors flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <ArrowRight size={16} className="text-tm-dim" />
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-6 border-t border-tm-border">
              <Link
                href={getHref("/register")}
                onClick={() => setIsOpen(false)}
                className="w-full tm-btn-solid justify-center py-3 flex items-center gap-2 text-center"
              >
                <Zap size={16} className="text-tm-accent" />
                <span>REGISTER NOW</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Infinite Marquee Ticker ── */
function TechnomaniaMarquee() {
  const items = [
    "TECH TATVA PRESENTS",
    "TECHNOMANIA 3.0",
    "24-HOUR HACKATHON",
    "ESPORTS CHAMPIONSHIP",
    "CULTURAL SHOWCASE",
    "CHANDIGARH UNIVERSITY",
    "TOTAL PRIZE POOL ₹XX,XXX",
    "LIVE LEADERBOARDS",
  ];

  return (
    <div className="border-y border-tm-border/60 bg-tm-surface/30 overflow-hidden py-3.5 select-none relative">
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-tm-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-tm-bg to-transparent z-10 pointer-events-none" />
      
      <div className="flex gap-8 whitespace-nowrap animate-marquee">
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-8 font-tm-mono text-xs text-tm-muted/80 tracking-[0.25em]">
            <span className="hover:text-tm-accent transition-colors">{text}</span>
            <span className="text-tm-accent font-bold text-sm">///</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TechnomaniaFooter() {
  const getHref = useTechnomaniaHref();

  return (
    <footer className="mt-20 border-t border-tm-border bg-tm-surface/60 backdrop-blur relative">
      <div className="absolute top-0 inset-x-0 h-1 tm-hazard-stripe opacity-50" />
      
      <div className="container mx-auto px-4 md:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr] items-start">
          {/* Col 1: Logos & Info */}
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative h-12 w-12">
                <Image
                  src="/technomania/techtatva-logo.png"
                  alt="Tech Tatva Club Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                />
              </div>
              <span className="text-white/20 text-lg font-mono">×</span>
              <div className="relative h-12 w-36">
                <Image
                  src="/technomania/logo-white.png"
                  alt="Technomania 3.0 Logo"
                  fill
                  className="object-contain drop-shadow-[0_0_15px_rgba(74,158,255,0.4)]"
                />
              </div>
            </div>
            
            <p className="text-xs font-tm-body text-tm-muted max-w-sm leading-relaxed">
              Technomania 3.0 — The flagship technical and cultural festival at Chandigarh University.
              24H Hackathon, Esports Arena, Cultural Showcases, and Live Leaderboards.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-tm-bg border border-tm-border rounded-full font-tm-mono text-[10px] text-tm-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping" />
              STATUS: REGISTRATIONS ACTIVE
            </div>
          </div>

          {/* Col 2: Navigation (100% Autonomous Festival Links) */}
          <div className="space-y-3">
            <p className="font-tm-mono text-xs font-bold tracking-[0.2em] text-tm-text uppercase">FESTIVAL NAVIGATION</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-tm-mono text-tm-muted">
              <Link href={getHref("/events")} className="hover:text-tm-accent transition">EVENTS</Link>
              <Link href={getHref("/schedule")} className="hover:text-tm-accent transition">SCHEDULE</Link>
              <Link href={getHref("/teams")} className="hover:text-tm-accent transition">TEAMS</Link>
              <Link href={getHref("/leaderboard")} className="hover:text-tm-accent transition">LEADERBOARD</Link>
              <Link href={getHref("/register")} className="hover:text-tm-accent transition">REGISTER</Link>
              <Link href={getHref("/")} className="hover:text-tm-accent transition">HOME</Link>
            </div>
          </div>

          {/* Col 3: Social & Support */}
          <div className="space-y-4">
            <p className="font-tm-mono text-xs font-bold tracking-[0.2em] text-tm-text uppercase">OFFICIAL CHANNELS</p>
            <div className="flex items-center gap-3">
              <a
                href={TM_CONFIG.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-tm-border bg-tm-bg flex items-center justify-center text-tm-muted hover:text-white hover:border-tm-accent hover:shadow-[0_0_10px_rgba(74,158,255,0.3)] transition-all"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href={TM_CONFIG.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-tm-border bg-tm-bg flex items-center justify-center text-tm-muted hover:text-white hover:border-tm-accent hover:shadow-[0_0_10px_rgba(74,158,255,0.3)] transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={TM_CONFIG.socialLinks.github}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg border border-tm-border bg-tm-bg flex items-center justify-center text-tm-muted hover:text-white hover:border-tm-accent hover:shadow-[0_0_10px_rgba(74,158,255,0.3)] transition-all"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
            </div>
            <p className="text-[11px] font-tm-mono text-tm-dim">
              CHANDIGARH UNIVERSITY · GHARUAN, MOHALI
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-tm-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-tm-mono text-tm-dim">
          <p>© 2026 TECHNOMANIA 3.0 · ALL RIGHTS RESERVED</p>
          <div className="flex items-center gap-6">
            <Link href={getHref("/events")} className="hover:text-tm-muted transition">ALL ARENAS</Link>
            <span>·</span>
            <Link href={getHref("/schedule")} className="hover:text-tm-muted transition">TIMELINE</Link>
            <span>·</span>
            <Link href={getHref("/register")} className="hover:text-tm-muted transition">SQUAD PASSES</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function TechnomaniaShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isAdmin = pathname.includes("/admin");

  if (isAdmin) {
    return <main className="min-h-screen relative z-10">{children}</main>;
  }

  return (
    <div className="min-h-screen bg-tm-bg text-tm-text selection:bg-tm-accent selection:text-tm-bg relative flex flex-col font-tm-body antialiased overflow-x-hidden">
      {/* Background grid */}
      <div className="fixed inset-0 tm-grid-bg pointer-events-none z-0" />
      
      {/* Navigation */}
      <TechnomaniaNav />

      {/* Top infinite marquee ticker */}
      <div className="mt-16 z-20">
        <TechnomaniaMarquee />
      </div>

      {/* Page content */}
      <main className="flex-grow relative z-10">
        {children}
      </main>

      {/* Footer */}
      <TechnomaniaFooter />
    </div>
  );
}

export default TechnomaniaShell;
