import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getClubInfo } from "@/lib/public-data";
import { MotionLogo, SiteLoader } from "@/components/brand-motion";

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const info = await getClubInfo();
  return <main className="min-h-screen overflow-hidden bg-ink">
    <SiteLoader logo={info.logo}/>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-black/55 backdrop-blur-xl md:bg-black/45"><div className="mx-auto flex min-h-28 max-w-7xl flex-col items-start justify-center gap-4 px-6 py-4 md:h-20 md:min-h-0 md:flex-row md:items-center md:justify-between md:gap-0 md:py-0"><MotionLogo logo={info.logo}/><nav className="flex w-full flex-wrap gap-2 text-[10px] font-semibold tracking-[.14em] text-white/58 md:w-auto md:gap-7 md:text-xs md:font-medium md:tracking-[.15em] md:text-white/50">{["ABOUT","EVENTS","TEAMS","GALLERY"].map(x=><Link className="rounded-full border border-white/[.08] bg-white/[.035] px-3 py-2 transition hover:text-white md:border-0 md:bg-transparent md:px-0 md:py-0" key={x} href={`/${x.toLowerCase()}`}>{x}</Link>)}</nav></div></header>
    {children}
    <footer className="border-t border-white/[.06] px-6 py-14"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row"><MotionLogo logo={info.logo}/><div className="max-w-sm text-sm leading-6 text-white/35">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</div><Link href="/contact" className="flex items-center gap-2 text-sm text-violet-300">Start a conversation <ArrowUpRight size={16}/></Link></div></footer>
  </main>;
}
