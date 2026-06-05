"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, Sparkles, X } from "lucide-react";

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

      {open ? <div className="mobile-menu fixed inset-0 isolate z-[2147483647] overflow-y-auto bg-[#030207] text-white md:hidden">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(168,85,247,.42),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(236,72,153,.24),transparent_34%),linear-gradient(180deg,#07040d_0%,#05030a_48%,#020105_100%)]" />
        <div className="pointer-events-none fixed inset-0 grid-bg opacity-[.07]" />
        <div className="relative flex min-h-dvh w-full flex-col px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))] shadow-2xl shadow-black/50">
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

          <div className="mt-8 rounded-[2rem] border border-white/[.08] bg-black/45 p-3 shadow-[0_30px_90px_rgba(0,0,0,.45)] backdrop-blur-2xl">
            <nav className="grid gap-2.5">
            {links.map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="mobile-menu-link group flex min-h-[3.9rem] items-center justify-between rounded-[1.35rem] border border-white/[.1] bg-white/[.07] px-5 text-lg font-semibold tracking-[-.02em] text-white shadow-[inset_0_1px_rgba(255,255,255,.06)] transition active:scale-[.98]"
                style={{ animationDelay: `${index * 24}ms` }}
              >
                <span>{label}</span>
                <ArrowUpRight size={18} className="text-violet-200/70 transition group-active:translate-x-0.5 group-active:-translate-y-0.5" />
              </Link>
            ))}
            </nav>
          </div>

          <div className="mt-4 rounded-3xl border border-violet-200/18 bg-violet-500/12 p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
              <Sparkles size={17} />
            </div>
            <p className="text-sm leading-6 text-white/68">Fast access for events, teams, registrations, and contact from one mobile-first panel.</p>
          </div>
        </div>
      </div> : null}
    </>
  );
}
