"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { createPortal } from "react-dom";
import {
  Home,
  Info,
  Calendar,
  Users,
  Briefcase,
  Award,
  Image as ImageIcon,
  Mail,
  LogIn,
  ArrowUpRight,
  Sparkles,
  UserPlus,
  Trophy
} from "lucide-react";
import { MotionLogo } from "./brand-motion";

const links = [
  ["Home", "/", Home],
  ["About", "/about", Info],
  ["Recruitment", "/recruitment", Briefcase],
  ["Join Us", "/join", UserPlus],
  ["Events", "/events", Calendar],
  ["Leaderboard", "/leaderboard", Trophy],
  ["Teams", "/teams", Users],
  ["Hall of Fame", "/hall-of-fame", Award],
  ["Gallery", "/gallery", ImageIcon],
  ["Contact", "/contact", Mail],
  ["Portal Login", "/login", LogIn]
] as const;

/* ── Container and item animation variants ── */
const containerVariants: Variants = {
  open: {
    transition: {
      staggerChildren: 0.038,
      delayChildren: 0.08,
    },
  },
  closed: {
    transition: {
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 28,
    },
  },
  closed: {
    opacity: 0,
    x: 28,
    scale: 0.96,
    transition: {
      duration: 0.15,
    },
  },
};

export function MobilePublicMenu({ logo }: { logo?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      {/* Morphing Hamburger-to-Close Button */}
      <motion.button
        onClick={toggleMenu}
        aria-label={isOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.92 }}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/80 shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-colors duration-200 hover:border-purple-500/40 active:border-purple-400 select-none"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/90"
        >
          {/* Top Line */}
          <motion.line
            x1="4"
            x2="20"
            animate={
              isOpen
                ? { y1: 12, y2: 12, rotate: 45, originX: "12px", originY: "12px" }
                : { y1: 6, y2: 6, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
          {/* Middle Line */}
          <motion.line
            x1="4"
            y1="12"
            x2="20"
            y2="12"
            animate={isOpen ? { opacity: 0, x: -6 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          />
          {/* Bottom Line */}
          <motion.line
            x1="4"
            x2="20"
            animate={
              isOpen
                ? { y1: 12, y2: 12, rotate: -45, originX: "12px", originY: "12px" }
                : { y1: 18, y2: 18, rotate: 0 }
            }
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
          />
        </svg>
      </motion.button>

      {/* Drawer Overlay rendered via Portal */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop blur overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={closeMenu}
                className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md"
              />

              {/* Slide-in drawer container with swipe-to-dismiss */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 240 }}
                drag="x"
                dragConstraints={{ left: 0, right: 320 }}
                dragElastic={0.2}
                onDragEnd={(_, { offset, velocity }) => {
                  if (offset.x > 80 || velocity.x > 300) {
                    closeMenu();
                  }
                }}
                className="fixed inset-y-0 right-0 z-[10000] flex w-[320px] max-w-[88vw] flex-col justify-between bg-black/95 border-l border-white/10 p-5 shadow-[0_0_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl touch-pan-y"
                style={{
                  height: "100dvh",
                  paddingTop: "calc(1.25rem + env(safe-area-inset-top, 0px))",
                  paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom, 0px))",
                  paddingLeft: "calc(1.25rem + env(safe-area-inset-left, 0px))",
                  paddingRight: "calc(1.25rem + env(safe-area-inset-right, 0px))",
                }}
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                  <div onClick={closeMenu} className="cursor-pointer">
                    <MotionLogo logo={logo} />
                  </div>
                  <motion.button
                    onClick={closeMenu}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Close Navigation Menu"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-white/90 transition hover:bg-white/[0.08]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </motion.button>
                </div>

                {/* Navigation Section Title */}
                <div className="flex items-center gap-2 px-2 py-2 mt-3">
                  <Sparkles className="text-purple-400 h-3.5 w-3.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400">Navigation</span>
                </div>

                {/* Navigation Items (Staggered Spring Cascades) */}
                <motion.nav
                  variants={containerVariants}
                  initial="closed"
                  animate="open"
                  exit="closed"
                  className="flex-1 overflow-y-auto py-1 pr-1 space-y-1.5"
                  aria-label="Mobile Navigation Drawer"
                >
                  {links.map(([label, href, Icon]) => {
                    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                      <motion.div key={href} variants={itemVariants}>
                        <Link
                          href={href}
                          onClick={closeMenu}
                          className={`group relative flex min-h-[3rem] items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs tracking-[0.04em] transition-all duration-200 select-none active:scale-[0.97] ${
                            active
                              ? "border-purple-500/80 bg-purple-950/40 text-purple-200 font-bold shadow-[0_0_18px_rgba(168,85,247,0.35)]"
                              : "border-white/[0.06] bg-white/[0.02] text-white/75 font-medium hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon
                              size={16}
                              className={`transition-colors duration-200 ${
                                active ? "text-purple-400" : "text-white/40 group-hover:text-white/80"
                              }`}
                            />
                            <span>{label}</span>
                          </div>

                          {/* Active pulsating beacon indicator */}
                          {active && (
                            <span className="relative flex h-2 w-2">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]" />
                            </span>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.nav>

                {/* Drawer Footer CTA */}
                <div className="border-t border-white/[0.08] pt-4 mt-auto">
                  <Link
                    href="/contact"
                    onClick={closeMenu}
                    className="group relative flex w-full min-h-[3.25rem] items-center justify-center gap-2 overflow-hidden rounded-xl border border-white/30 bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-600 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_0_25px_rgba(168,85,247,0.5)] transition-all duration-300 active:scale-[0.97]"
                  >
                    <span className="relative z-10 font-mono">Connect with us</span>
                    <ArrowUpRight size={14} className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    <span className="pointer-events-none absolute -inset-full h-[300%] w-[50%] -rotate-45 bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 group-hover:translate-x-[400%]" />
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
