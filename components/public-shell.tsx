import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getClubInfo } from "@/lib/public-data";
import { MotionLogo, SiteLoader } from "@/components/brand-motion";
import { MobilePublicMenu } from "@/components/mobile-public-menu";

const publicLinks = [
  ["ABOUT", "/about"],
  ["EVENTS", "/events"],
  ["TEAMS", "/teams"],
  ["HALL OF FAME", "/hall-of-fame"],
  ["GALLERY", "/gallery"]
] as const;

export async function PublicShell({ children }: { children: React.ReactNode }) {
  const info = await getClubInfo();
  return <main className="public-site min-h-screen overflow-hidden">
    <SiteLoader logo={info.logo}/>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/70 bg-[#fffdf8]/86 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 md:h-20 md:flex-row md:items-center md:justify-between md:px-6 md:py-0"><MotionLogo logo={info.logo}/><nav className="hidden w-auto gap-7 text-xs font-semibold tracking-[.15em] text-stone-500 md:flex">{publicLinks.map(([label,href])=><Link className="transition hover:text-stone-950" key={href} href={href}>{label}</Link>)}</nav><MobilePublicMenu/></div></header>
    <div className="h-9 md:hidden" />
    {children}
    <footer className="border-t border-stone-200/70 px-6 py-14"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[1.75rem] border border-stone-200/80 bg-white/72 p-6 shadow-[0_24px_70px_rgba(88,65,46,.08)] md:flex-row md:items-center"><MotionLogo logo={info.logo}/><div className="max-w-sm text-sm leading-6 text-stone-500">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</div><Link href="/contact" className="ghost-pill flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm transition hover:-translate-y-0.5">Start a conversation <ArrowUpRight size={16}/></Link></div></footer>
  </main>;
}
