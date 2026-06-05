"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();

  return (
    <nav className="w-full md:hidden" aria-label="Mobile navigation">
      <div className="grid grid-cols-4 gap-2">
        {links.map(([label, href]) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              className={`flex min-h-10 items-center justify-center rounded-2xl border px-2 py-2 text-center text-[9px] font-semibold uppercase tracking-[.12em] transition active:scale-[.97] ${
                active
                  ? "border-violet-200/35 bg-violet-400/18 text-white shadow-[0_0_22px_rgba(168,85,247,.18)]"
                  : "border-white/[.08] bg-white/[.045] text-white/52"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
