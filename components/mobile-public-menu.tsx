"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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
  Sparkles
} from "lucide-react";

const links = [
  ["Home", "/", Home],
  ["About", "/about", Info],
  ["Events", "/events", Calendar],
  ["Teams", "/teams", Users],
  ["Recruitment", "/recruitment", Briefcase],
  ["Hall of Fame", "/hall-of-fame", Award],
  ["Gallery", "/gallery", ImageIcon],
  ["Contact", "/contact", Mail],
  ["Portal Login", "/login", LogIn]
] as const;

export function MobilePublicMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <div className="md:hidden">
      {/* Hamburger Trigger Button */}
      <button
        onClick={toggleMenu}
        aria-label="Toggle Navigation Menu"
        aria-expanded={isOpen}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[.08] bg-white/[.04] text-white/70 shadow-[inset_0_1px_rgba(255,255,255,.05)] backdrop-blur-xl transition active:scale-[.95] hover:text-white hover:border-white/20"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMenu}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
            />

            {/* Slide-in drawer container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col justify-between bg-gradient-to-b from-[#110817]/98 to-[#060309]/98 p-6 shadow-2xl border-l border-white/[0.08]"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-violet-300 h-4 w-4 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-violet-200/80">Navigation</span>
                </div>
                <button
                  onClick={toggleMenu}
                  aria-label="Close Navigation Menu"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/[.08] bg-white/[.03] text-white/55 transition hover:bg-white/[.08] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-6 pr-1 space-y-1" aria-label="Mobile Navigation Drawer">
                {links.map(([label, href, Icon]) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <Link
                      href={href}
                      key={href}
                      onClick={toggleMenu}
                      className={`flex min-h-12 items-center gap-3.5 rounded-2xl border px-4 py-3 text-xs font-semibold tracking-[0.04em] transition active:scale-[0.98] ${
                        active
                          ? "border-violet-200/35 bg-violet-400/18 text-white shadow-[0_0_20px_rgba(168,85,247,0.14)]"
                          : "border-transparent bg-transparent text-white/55 hover:bg-white/[0.03] hover:text-white"
                      }`}
                    >
                      <Icon size={16} className={active ? "text-violet-200" : "text-white/35"} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer CTA */}
              <div className="border-t border-white/[0.06] pt-4">
                <Link
                  href="/contact"
                  onClick={toggleMenu}
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_rgba(168,85,247,0.22)] transition active:scale-[0.98]"
                >
                  <span>Connect with us</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
