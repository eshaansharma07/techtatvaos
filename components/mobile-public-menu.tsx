"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

const links = [
  ["Home", "/"],
  ["About", "/about"],
  ["Events", "/events"],
  ["Teams", "/teams"],
  ["Hall of Fame", "/hall-of-fame"],
  ["Gallery", "/gallery"],
  ["Contact", "/contact"],
  ["Login", "/login"]
] as const;

export function MobilePublicMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mobile-nav-trigger grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[.07] text-white shadow-[0_14px_40px_rgba(0,0,0,.28)] backdrop-blur-xl md:hidden"
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>

      <div className={`mobile-menu fixed inset-0 z-[999] overflow-y-auto bg-[#05040a] md:hidden ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(168,85,247,.34),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(236,72,153,.2),transparent_32%),linear-gradient(180deg,#05040a,#090612_58%,#030207)]" />
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[.08]" />
        <div className={`relative flex min-h-dvh w-full flex-col p-6 pt-[max(1.5rem,env(safe-area-inset-top))] shadow-2xl shadow-black/50 transition duration-300 ${open ? "translate-y-0" : "translate-y-4"}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-violet-200/70">Tech Tatva</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-.04em]">Navigate</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-black/25 text-white/75"
              aria-label="Close navigation"
            >
              <X size={19} />
            </button>
          </div>

          <nav className="mt-10 grid gap-3">
            {links.map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="mobile-menu-link group flex min-h-[4.35rem] items-center justify-between rounded-3xl border border-white/[.1] bg-white/[.065] px-5 text-lg font-semibold tracking-[-.02em] text-white shadow-[inset_0_1px_rgba(255,255,255,.06)] transition active:scale-[.98]"
                style={{ transitionDelay: open ? `${index * 28}ms` : "0ms" }}
              >
                <span>{label}</span>
                <ArrowUpRight size={18} className="text-violet-200/70 transition group-active:translate-x-0.5 group-active:-translate-y-0.5" />
              </Link>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-violet-200/18 bg-violet-500/12 p-5">
            <p className="text-sm leading-6 text-white/68">Fast access for events, teams, registrations, and contact from one mobile-first panel.</p>
          </div>
        </div>
      </div>
    </>
  );
}
