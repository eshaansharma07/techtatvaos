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
      <div className="flex gap-2 overflow-x-auto pb-1">
        {links.map(([label, href]) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              href={href}
              key={href}
              className={`flex min-h-11 shrink-0 items-center justify-center rounded-full border px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[.12em] transition active:scale-[.97] ${
                active
                  ? "border-stone-950 bg-stone-950 text-white shadow-[0_14px_34px_rgba(82,52,30,.16)]"
                  : "border-stone-200 bg-white text-stone-600"
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
