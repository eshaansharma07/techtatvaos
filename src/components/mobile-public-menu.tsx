"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
  ArrowUpRight,
  Sparkles,
  UserPlus
} from "lucide-react";
import { MotionLogo } from "./brand-motion";

const links = [
  ["Home", "/", Home],
  ["About", "/about", Info],
  ["Recruitment", "/recruitment", Briefcase],
  ["Join Us", "/join", UserPlus],
  ["Events", "/events", Calendar],
  ["Teams", "/teams", Users],
  ["Hall of Fame", "/hall-of-fame", Award],
  ["Gallery", "/gallery", ImageIcon],
  ["Contact", "/contact", Mail],
  ["Portal Login", "/login", LogIn]
] as const;

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
      document.body.classList.add("force-native-cursor");
    } else {
      document.body.style.overflow = "";
      document.body.classList.remove("force-native-cursor");
    }
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("force-native-cursor");
    };
  }, [isOpen]);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      {/* Hamburger Trigger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle Navigation Menu"
        aria-expanded={isOpen}
        className="flex h-11 w-11 items-center justify-center glass-brutalist rounded-xl text-white/80 transition active:scale-[.95]"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Drawer Overlay rendered via Portal to prevent header containing-block constraints */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop blur overlay with high z-index */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleMenu}
                className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md"
              />

              {/* Slide-in drawer container (opaque gradient background to block homepage content) */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 220 }}
                className="fixed inset-y-0 right-0 z-[10000] flex w-[310px] max-w-[85vw] flex-col justify-between glass-brutalist bg-black/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.85)] border-l-2 border-black pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-[calc(1.5rem+env(safe-area-inset-left))] pr-[calc(1.5rem+env(safe-area-inset-right))]"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <div onClick={toggleMenu} className="cursor-pointer">
                    <MotionLogo logo={logo} />
                  </div>
                  <button
                    onClick={toggleMenu}
                    aria-label="Close Navigation Menu"
                    className="flex h-11 w-11 items-center justify-center glass-brutalist rounded-xl text-white/85 transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Navigation Section Title */}
                <div className="flex items-center gap-2 px-3 py-2 mt-4">
                  <Sparkles className="text-purple-400 h-3.5 w-3.5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-purple-400">Navigation</span>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 overflow-y-auto py-2 pr-1 space-y-1" aria-label="Mobile Navigation Drawer">
                  {links.map(([label, href, Icon]) => {
                    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                    return (
                      <Link
                        href={href}
                        key={href}
                        onClick={toggleMenu}
                        className={`flex min-h-12 items-center gap-3.5 rounded-xl border-2 px-4 py-3 text-xs tracking-[0.04em] transition active:scale-[0.98] ${
                          active
                            ? "border-purple-500 bg-black text-purple-400 font-bold shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)]"
                            : "border-transparent bg-transparent text-white/80 font-medium hover:bg-white/[0.03] hover:text-white"
                        }`}
                      >
                        <Icon size={16} className={active ? "text-purple-400" : "text-white/35"} />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* Drawer Footer CTA */}
                <div className="border-t border-white/[0.06] pt-4 mt-auto">
                  <Link
                    href="/contact"
                    onClick={toggleMenu}
                    className="brutalist-btn-purple flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-xl text-xs font-bold uppercase tracking-[0.14em] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(255,255,255,0.8)] transition active:scale-[0.98] duration-300"
                  >
                    <span>Connect with us</span>
                    <ArrowUpRight size={14} />
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
