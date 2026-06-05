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
  return <main className="min-h-screen overflow-hidden bg-ink">
    <SiteLoader logo={info.logo}/>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.06] bg-black/70 backdrop-blur-xl md:bg-black/45"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:h-20 md:px-6"><MotionLogo logo={info.logo}/><nav className="hidden w-auto gap-7 text-xs font-medium tracking-[.15em] text-white/50 md:flex">{publicLinks.map(([label,href])=><Link className="transition hover:text-white" key={href} href={href}>{label}</Link>)}</nav><MobilePublicMenu/></div></header>
    {children}
    <footer className="border-t border-white/[.06] px-6 py-14"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[1.75rem] border border-white/[.06] bg-white/[.018] p-6 md:flex-row md:items-center"><MotionLogo logo={info.logo}/><div className="max-w-sm text-sm leading-6 text-white/38">{info.footerCopy || "Ideas, events, teams, and stories from the Tech Tatva community."}</div><Link href="/contact" className="ghost-pill flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm text-violet-100 transition hover:-translate-y-0.5">Start a conversation <ArrowUpRight size={16}/></Link></div></footer>
  </main>;
}
